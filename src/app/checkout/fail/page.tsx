import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = { title: "결제 실패" };

// 토스가 실패 리다이렉트 때 붙여 주는 code, message를 그대로 보여준다
export default async function CheckoutFailPage(props: PageProps<"/checkout/fail">) {
  const sp = await props.searchParams;
  const message = typeof sp.message === "string" ? sp.message : "결제가 완료되지 않았어.";
  const code = typeof sp.code === "string" ? sp.code : null;

  return (
    <div className="wrap pt-8">
      <PageTitle>결제가 안 됐어.</PageTitle>
      <p className="measure mt-3">{message}</p>
      {code && <p className="mt-1 text-note text-muted">오류 코드 {code}</p>}
      <Link href="/checkout" className="btn btn-primary mt-6">
        다시 결제하기
      </Link>
    </div>
  );
}
