import Link from "next/link";
import type { Product } from "@/lib/types";
import { won } from "@/lib/format";
import { Thumb } from "./Thumb";

// 자료 목록 한 행: 썸네일 / 정보 / 가격+버튼
// 모바일(600px 이하)에서는 가격+버튼이 정보 아래로 내려간다.
export function ProductRow({
  product,
  action,
  showPrice = true,
}: {
  product: Product;
  action: React.ReactNode;
  showPrice?: boolean;
}) {
  return (
    <li
      className="grid grid-cols-[56px_1fr] gap-x-4 gap-y-3 border-b border-line py-[18px] sm:grid-cols-[72px_1fr_auto] sm:gap-x-5"
    >
      <Thumb
        src={product.coverUrl}
        className="row-span-2 h-[72px] w-14 sm:row-span-1 sm:h-[92px] sm:w-[72px]"
      />
      <div className="min-w-0">
        <p className="text-note font-semibold text-grid">{product.category}</p>
        <h3 className="mt-0.5 text-item">
          <Link href={`/products/${product.id}`} className="mark-hover">
            {product.title}
          </Link>
        </h3>
        <p className="measure mt-1 line-clamp-2 text-meta text-muted">
          {product.pages}쪽 PDF · {product.description}
        </p>
      </div>
      <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-3 sm:flex-col sm:items-end sm:justify-start">
        {showPrice && <p className="font-semibold">{won(product.price)}</p>}
        {action}
      </div>
    </li>
  );
}

// 목록 맨 위 1px --ink 선
export function ProductList({ children }: { children: React.ReactNode }) {
  return <ul className="border-t border-ink">{children}</ul>;
}
