import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { requireViewer } from "@/lib/guard";
import { getCheckoutOrder } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { won } from "@/lib/format";
import { CheckoutForm } from "./CheckoutForm";
import { retryOrderAction } from "./actions";

export const metadata: Metadata = { title: "결제" };

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const sp = await props.searchParams;
  const orderId = typeof sp.orderId === "string" ? sp.orderId : "";
  const viewer = await requireViewer(orderId ? `/checkout?orderId=${orderId}` : "/cart");

  // 주문이 없으면 장바구니에서 시작
  const order = orderId ? await getCheckoutOrder(viewer.id, orderId) : null;
  if (!order) redirect("/cart");
  if (order.status === "paid") redirect("/library");

  if (order.status === "failed") {
    return (
      <div className="wrap pt-8">
        <PageTitle>결제</PageTitle>
        <p className="mt-3">이 주문은 결제가 안 된 채로 끝났어. 같은 자료로 다시 결제할 수 있어.</p>
        <form action={retryOrderAction} className="mt-6">
          <input type="hidden" name="orderId" value={order.orderId} />
          <button type="submit" className="btn btn-primary">
            다시 결제하기
          </button>
        </form>
      </div>
    );
  }

  // 위젯에 넘길 customerKey (무작위 키, 본인 행만 읽힘)
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("customer_key, name")
    .eq("id", viewer.id)
    .single();

  return (
    <div className="wrap pt-8">
      <PageTitle>결제</PageTitle>
      <div className="mt-6 max-w-[560px]">
        {/* 주문 요약: 금액은 서버가 만든 주문의 금액 */}
        <section aria-labelledby="order-title" className="mb-8">
          <h2 id="order-title" className="sr-only">
            주문 내용
          </h2>
          <ul className="border-t border-ink">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4 border-b border-line py-3">
                <span className="font-serif text-[17px]">{it.title}</span>
                <span className="shrink-0">{won(it.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between text-[18px] font-semibold">
            <span>합계</span>
            <span>{won(order.amount)}</span>
          </div>
          <Link href="/cart" className="mt-2 inline-flex min-h-10 items-center text-meta text-muted hover:text-ink">
            장바구니로 돌아가기
          </Link>
        </section>

        <CheckoutForm
          clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""}
          customerKey={profile?.customer_key ?? ""}
          orderId={order.orderId}
          orderName={order.orderName}
          amount={order.amount}
          defaultName={profile?.name ?? ""}
          defaultEmail={viewer.email ?? ""}
        />
      </div>
    </div>
  );
}
