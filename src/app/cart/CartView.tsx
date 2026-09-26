"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/useHydrated";
import { won } from "@/lib/format";
import { MOCK_PRODUCTS } from "@/lib/mock";

export function CartView() {
  const hydrated = useHydrated();
  const cart = useCart();

  // localStorage를 읽기 전엔 자리표시자
  if (!hydrated) {
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

  // TODO(4단계): 목업 대신 서버에서 id로 상품 정보를 받아온다
  const items = MOCK_PRODUCTS.filter((p) => cart.ids.includes(p.id));
  if (items.length === 0) {
    return (
      <div className="border-t border-ink py-12">
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
      <div className="mt-6 flex justify-end">
        {/* TODO(4단계): 서버 API로 pending 주문 생성 후 이동 */}
        <Link href="/checkout" className="btn btn-primary">
          결제하기
        </Link>
      </div>
    </>
  );
}
