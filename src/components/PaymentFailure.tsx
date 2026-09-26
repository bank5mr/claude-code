import Link from "next/link";
import { PageTitle } from "./PageTitle";
import { retryOrderAction } from "@/app/checkout/actions";

// 결제 실패 화면: 토스가 준 실패 사유 + 다시 결제하기
export function PaymentFailure({
  message,
  code,
  orderId,
}: {
  message: string;
  code?: string | null;
  orderId?: string | null;
}) {
  return (
    <div className="wrap pt-8">
      <PageTitle>결제가 안 됐어.</PageTitle>
      <p className="measure mt-3" role="alert">
        {message}
      </p>
      {code && <p className="mt-1 text-note text-muted">오류 코드 {code}</p>}
      <div className="mt-6 flex flex-wrap gap-2">
        {orderId ? (
          <form action={retryOrderAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <button type="submit" className="btn btn-primary">
              다시 결제하기
            </button>
          </form>
        ) : (
          <Link href="/cart" className="btn btn-primary">
            다시 결제하기
          </Link>
        )}
        <Link href="/cart" className="btn btn-secondary">
          장바구니로
        </Link>
      </div>
    </div>
  );
}
