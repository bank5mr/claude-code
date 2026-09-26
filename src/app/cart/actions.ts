"use server";

import { getViewer } from "@/lib/auth";
import { createPendingOrder, type CreateOrderResult } from "@/lib/orders";

// 장바구니 "결제하기": 서버가 DB 가격으로 pending 주문을 만든다
export async function createOrderAction(productIds: string[]): Promise<CreateOrderResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "로그인이 필요해. 로그인한 뒤 다시 결제해 줘." };
  return createPendingOrder(viewer.id, productIds);
}
