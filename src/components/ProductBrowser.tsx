"use client";

import { useState } from "react";
import { CATEGORIES, type Category, type Product } from "@/lib/types";
import { ProductList, ProductRow } from "./ProductRow";
import { CartButton } from "./CartButton";

type Filter = "전체" | Category;
const FILTERS: Filter[] = ["전체", ...CATEGORIES];

// 분류 필터 칩 + 자료 목록
export function ProductBrowser({
  products,
  purchasedIds,
}: {
  products: Product[];
  purchasedIds: string[];
}) {
  const [filter, setFilter] = useState<Filter>("전체");
  const shown = filter === "전체" ? products : products.filter((p) => p.category === filter);

  return (
    <section aria-labelledby="list-title">
      <h2 id="list-title" className="sr-only">
        자료 목록
      </h2>
      <div role="group" aria-label="분류" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f)}
              className={`min-h-10 rounded-full border px-4 text-meta transition-colors duration-150 ${
                on ? "border-grid font-semibold text-grid" : "border-line hover:border-muted"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
      {shown.length === 0 ? (
        <p className="border-t border-ink py-12 text-muted">이 분류엔 아직 자료가 없어.</p>
      ) : (
        <ProductList>
          {shown.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              action={<CartButton productId={p.id} purchased={purchasedIds.includes(p.id)} />}
            />
          ))}
        </ProductList>
      )}
    </section>
  );
}
