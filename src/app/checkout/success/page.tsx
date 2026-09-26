import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PaymentFailure } from "@/components/PaymentFailure";
import { requireViewer } from "@/lib/guard";
import { confirmOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "결제 확인" };

// 토스 successUrl: paymentKey, orderId, amount를 서버에서 검증 → 승인 API → paid
export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const sp = await props.searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);
  const q = { paymentKey: pick("paymentKey"), orderId: pick("orderId"), amount: pick("amount") };

  const viewer = await requireViewer("/cart");
  const result = await confirmOrder(viewer.id, q);

  // 승인 성공 (또는 이미 승인된 주문) → 내 자료로
  if (result.ok) redirect("/library?paid=1");

  return (
    <PaymentFailure
      message={result.message}
      code={result.code}
      orderId={result.retryable ? q.orderId : null}
    />
  );
}
