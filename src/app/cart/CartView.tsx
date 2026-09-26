"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrderAction } from "./actions";
import { useCartProducts } from "@/lib/useCartProducts";
import { won } from "@/lib/format";

export function CartView({ loggedIn }: { loggedIn: boolean }) {
  const { products: items, cart } = useCartProducts();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 불러오기 전엔 자리표시자
  if (items === null) {
    return (
      <div aria-hidden className="border-t border-ink">
        {[0, 1].map((i) => (
          <div key={i} className="flex justify-between border-b border-line py-4">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-t border-ink py-12">
        {/* 결제하기에서 자료가 빠져 장바구니가 빈 경우에도 이유를 보여준다 */}
        {error && (
          <p className="mb-2 text-meta text-danger" role="alert">
            {error}
          </p>
        )}
        <p className="text-muted">장바구니가 비었어.</p>
        <Link href="/" className="btn btn-secondary mt-4">
          자료 보러 가기
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      <ul className="border-t border-ink">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-4 border-b border-line py-3"
          >
            <Link href={`/products/${p.id}`} className="mark-hover min-w-0 font-serif text-[17px]">
              {p.title}
            </Link>
            <div className="flex shrink-0 items-center gap-3">
              <span>{won(p.price)}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => cart.remove(p.id)}
                aria-label={`${p.title} 빼기`}
              >
                빼기
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* 합계 행 */}
      <div className="mt-3 flex items-center justify-between text-[18px] font-semibold">
        <span>합계</span>
        <span>{won(total)}</span>
      </div>
      <div className="mt-6 flex flex-col items-end gap-2">
        {loggedIn ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                // 서버가 DB 가격으로 주문을 만든다 (여기 보이는 가격은 표시용)
                const res = await createOrderAction(items.map((p) => p.id));
                if (res.ok) {
                  router.push(`/checkout?orderId=${res.orderId}`);
                  return;
                }
                res.removeIds?.forEach((id) => cart.remove(id));
                setError(res.message);
              });
            }}
          >
            {pending ? "주문 만드는 중…" : "결제하기"}
          </button>
        ) : (
          <>
            <Link href="/login?next=/cart" className="btn btn-primary">
              로그인하고 결제하기
            </Link>
            <p className="text-meta text-muted">결제한 자료를 내 자료에 모아 두려면 로그인이 필요해.</p>
          </>
        )}
        {error && (
          <p className="text-meta text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
