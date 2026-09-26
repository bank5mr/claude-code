import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPayment, getPaymentByOrderId, type TossPayment } from "@/lib/toss";
import { toProductFromRow } from "./productMapper";
import type { Product } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID_RE = /^[A-Za-z0-9_-]{6,64}$/;
const MAX_ITEMS = 50;

export type OrderRow = {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  payment_key: string | null;
  created_at: string;
};

// 토스 orderId: 영문/숫자/-/_ 6~64자, 추측할 수 없게 무작위로
function newOrderId() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `hk-${ymd}-${randomUUID().replaceAll("-", "")}`;
}

// "현대시 정리 노트 외 2건" (최대 100자)
function makeOrderName(titles: string[]) {
  const first = titles[0] ?? "한칸 자료";
  const rest = titles.length > 1 ? ` 외 ${titles.length - 1}건` : "";
  const max = 100 - rest.length;
  return (first.length > max ? `${first.slice(0, max - 1)}…` : first) + rest;
}

// 사용자가 이미 산(paid) 자료 id
export async function getPurchasedProductIds(userId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("order_items")
    .select("product_id, orders!inner(user_id, status)")
    .eq("orders.user_id", userId)
    .eq("orders.status", "paid");
  if (error) throw new Error(`구매 내역을 못 불러왔어: ${error.message}`);
  return [...new Set((data ?? []).map((r) => r.product_id as string))];
}

// 내 자료: 산 자료 목록 (비공개로 바뀐 자료도 산 사람에겐 보인다)
export async function getLibraryProducts(userId: string): Promise<Product[]> {
  const ids = await getPurchasedProductIds(userId);
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id, title, category, description, price, pages, preview_paths, is_published, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`내 자료를 못 불러왔어: ${error.message}`);
  return (data ?? []).map(toProductFromRow);
}

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; message: string; removeIds?: string[] };

// 1) 결제 전: 장바구니 id로 DB 가격을 합산해 pending 주문을 만든다.
//    클라이언트가 보낸 가격은 받지도 않는다.
export async function createPendingOrder(userId: string, rawIds: unknown): Promise<CreateOrderResult> {
  const ids = Array.isArray(rawIds)
    ? [...new Set(rawIds.filter((v): v is string => typeof v === "string" && UUID_RE.test(v)))]
    : [];
  if (ids.length === 0) return { ok: false, message: "장바구니가 비었어." };
  if (ids.length > MAX_ITEMS) return { ok: false, message: `한 번에 ${MAX_ITEMS}개까지 결제할 수 있어.` };

  const admin = createAdminClient();

  // 공개 중인 자료만, DB 가격으로
  const { data: products, error } = await admin
    .from("products")
    .select("id, title, price")
    .in("id", ids)
    .eq("is_published", true);
  if (error) return { ok: false, message: "자료 정보를 불러오지 못했어. 잠시 뒤 다시 시도해 줘." };

  const found = new Map(products.map((p) => [p.id as string, p]));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length > 0) {
    return {
      ok: false,
      message: "판매가 끝난 자료가 있어서 장바구니에서 뺐어. 다시 결제해 줘.",
      removeIds: missing,
    };
  }

  // 이미 산 자료는 다시 사지 않게
  const owned = new Set(await getPurchasedProductIds(userId));
  const dup = ids.filter((id) => owned.has(id));
  if (dup.length > 0) {
    return {
      ok: false,
      message: "이미 산 자료가 있어서 장바구니에서 뺐어. 내 자료에서 받을 수 있어.",
      removeIds: dup,
    };
  }

  const items = ids.map((id) => found.get(id)!);
  const amount = items.reduce((sum, p) => sum + (p.price as number), 0);
  const orderId = newOrderId();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({ user_id: userId, order_id: orderId, amount, status: "pending" })
    .select("id")
    .single();
  if (orderError) return { ok: false, message: "주문을 만들지 못했어. 잠시 뒤 다시 시도해 줘." };

  // 주문 항목은 이 시점 가격으로 함께 저장한다. 내 자료에는 paid 주문만 보인다.
  const { error: itemsError } = await admin.from("order_items").insert(
    items.map((p) => ({ order_id: order.id, product_id: p.id, price_at_purchase: p.price })),
  );
  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return { ok: false, message: "주문을 만들지 못했어. 잠시 뒤 다시 시도해 줘." };
  }

  return { ok: true, orderId };
}

export type CheckoutOrder = {
  orderId: string;
  amount: number;
  status: OrderRow["status"];
  orderName: string;
  items: { title: string; price: number }[];
};

// 결제 화면에 보여줄 주문 (본인 주문만)
export async function getCheckoutOrder(userId: string, orderId: string): Promise<CheckoutOrder | null> {
  if (!ORDER_ID_RE.test(orderId)) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("order_id, amount, status, user_id, order_items(price_at_purchase, products(title))")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error || !data || data.user_id !== userId) return null;

  const items = (data.order_items as unknown as { price_at_purchase: number; products: { title: string } | null }[]).map(
    (i) => ({ title: i.products?.title ?? "(삭제된 자료)", price: i.price_at_purchase }),
  );
  return {
    orderId: data.order_id,
    amount: data.amount,
    status: data.status,
    orderName: makeOrderName(items.map((i) => i.title)),
    items,
  };
}

// 실패 처리 (pending일 때만)
export async function markOrderFailed(userId: string, orderId: string) {
  if (!ORDER_ID_RE.test(orderId)) return;
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ status: "failed" })
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .eq("status", "pending");
}

// 실패한 주문과 같은 자료로 새 주문 만들기 ("다시 결제하기")
export async function recreateOrder(userId: string, orderId: string): Promise<CreateOrderResult> {
  if (!ORDER_ID_RE.test(orderId)) return { ok: false, message: "주문을 찾지 못했어. 장바구니에서 다시 결제해 줘." };
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, user_id, order_items(product_id)")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!data || data.user_id !== userId) {
    return { ok: false, message: "주문을 찾지 못했어. 장바구니에서 다시 결제해 줘." };
  }
  const ids = (data.order_items as { product_id: string }[]).map((i) => i.product_id);
  return createPendingOrder(userId, ids);
}

export type ConfirmResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; retryable: boolean };

// 토스 응답이 이 주문과 맞는지 (주문번호, 상태, 금액)
function isPaidFor(p: TossPayment, order: OrderRow) {
  return p.orderId === order.order_id && p.status === "DONE" && p.totalAmount === order.amount;
}

async function markPaid(order: OrderRow, paymentKey: string) {
  const admin = createAdminClient();
  // pending일 때만 paid로. 이미 paid면 아무 일도 없다 (멱등)
  await admin
    .from("orders")
    .update({ status: "paid", payment_key: paymentKey })
    .eq("id", order.id)
    .eq("status", "pending");
}

// 3) successUrl로 돌아왔을 때: 검증 후 승인 API 호출
export async function confirmOrder(
  userId: string,
  q: { paymentKey: string | null; orderId: string | null; amount: string | null },
): Promise<ConfirmResult> {
  const fail = (message: string, code?: string): ConfirmResult => ({ ok: false, message, code, retryable: true });

  if (!q.paymentKey || !q.orderId || !q.amount || !ORDER_ID_RE.test(q.orderId) || q.paymentKey.length > 200) {
    return { ok: false, message: "결제 정보가 올바르지 않아. 장바구니에서 다시 결제해 줘.", retryable: false };
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("order_id", q.orderId).maybeSingle<OrderRow>();
  if (!order || order.user_id !== userId) {
    return { ok: false, message: "주문을 찾지 못했어. 장바구니에서 다시 결제해 줘.", retryable: false };
  }

  // 이미 처리된 주문 (새로고침, 뒤로 가기 등)
  if (order.status === "paid") return { ok: true };
  if (order.status === "failed") return fail("이미 실패로 끝난 주문이야. 다시 결제해 줘.");

  // 금액 검증: 토스가 돌려준 amount와 DB 주문 금액이 다르면 승인하지 않는다
  if (Number(q.amount) !== order.amount) {
    await markOrderFailed(userId, order.order_id);
    return fail("결제 금액이 주문 금액과 달라서 결제를 멈췄어. 돈은 나가지 않았어.", "AMOUNT_MISMATCH");
  }

  // 승인 요청 (금액은 쿼리 값이 아니라 DB 금액으로)
  const res = await confirmPayment({ paymentKey: q.paymentKey, orderId: order.order_id, amount: order.amount });
  if (res.ok && isPaidFor(res.payment, order)) {
    await markPaid(order, res.payment.paymentKey);
    return { ok: true };
  }

  // 승인 API가 실패해도 곧바로 실패 처리하지 않고, 실제 결제 상태를 조회해 확인한다
  const check = await getPaymentByOrderId(order.order_id);
  if (check.ok && isPaidFor(check.payment, order)) {
    await markPaid(order, check.payment.paymentKey);
    return { ok: true };
  }

  // 결과를 알 수 없으면 pending 그대로 두고 다시 확인하게 한다
  if (!res.ok && "unknown" in res) {
    return {
      ok: false,
      message: "결제 확인이 늦어지고 있어. 잠시 뒤 이 페이지를 새로고침해 줘.",
      code: res.error.code,
      retryable: false,
    };
  }

  await markOrderFailed(userId, order.order_id);
  const error = res.ok ? { code: "INVALID_PAYMENT", message: "결제 정보가 주문과 맞지 않아." } : res.error;
  return fail(error.message, error.code);
}
