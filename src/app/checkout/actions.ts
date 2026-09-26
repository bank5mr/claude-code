"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { recreateOrder } from "@/lib/orders";

// "다시 결제하기": 같은 자료로 새 주문을 만들어 결제 화면으로
export async function retryOrderAction(formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/cart");
  const orderId = String(formData.get("orderId") ?? "");
  const res = await recreateOrder(viewer.id, orderId);
  // 새 주문을 못 만들면(판매 종료, 이미 구매 등) 장바구니에서 다시 시작
  redirect(res.ok ? `/checkout?orderId=${res.orderId}` : "/cart");
}
