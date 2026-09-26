import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = { title: "결제 완료" };

// TODO(4단계): paymentKey, orderId, amount를 서버에서 검증하고 승인 API 호출 후 /library로 이동
export default function CheckoutSuccessPage() {
  return (
    <div className="wrap pt-8">
      <PageTitle>결제가 끝났어.</PageTitle>
      <p className="measure mt-3 text-muted">산 자료는 내 자료에서 바로 내려받을 수 있어.</p>
      <Link href="/library" className="btn btn-primary mt-6">
        내 자료로 가기
      </Link>
    </div>
  );
}
