import type { Metadata } from "next";
import { PaymentFailure } from "@/components/PaymentFailure";
import { requireViewer } from "@/lib/guard";
import { markOrderFailed } from "@/lib/orders";

export const metadata: Metadata = { title: "결제 실패" };

// 토스 failUrl: code, message, (orderId). 승인 API는 부르지 않는다.
// 구매자가 취소하면 토스가 orderId를 안 주므로 failUrl에 직접 붙인 order 값을 쓴다.
export default async function CheckoutFailPage(props: PageProps<"/checkout/fail">) {
  const sp = await props.searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);
  const orderId = pick("orderId") ?? pick("order");
  const code = pick("code");
  const message =
    code === "PAY_PROCESS_CANCELED"
      ? "결제를 취소했어. 다시 결제하려면 아래 버튼을 눌러 줘."
      : (pick("message") ?? "결제가 완료되지 않았어.");

  const viewer = await requireViewer("/cart");
  if (orderId) await markOrderFailed(viewer.id, orderId);

  return <PaymentFailure message={message} code={code} orderId={orderId} />;
}
