"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toProductFromRow } from "./productMapper";
import type { Product } from "./types";
import { useCart } from "./cart";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 장바구니 id로 공개 자료 정보를 불러온다.
// 여기 가격은 "표시용"일 뿐이고, 결제 금액은 서버가 DB에서 다시 계산한다.
export function useCartProducts() {
  const cart = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const key = cart.ids.join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = key ? key.split(",") : [];
    const valid = ids.filter((id) => UUID_RE.test(id));

    (async () => {
      if (valid.length === 0) {
        if (!cancelled) setProducts([]);
      } else {
        const { data, error } = await createClient()
          .from("products")
          .select("id, title, category, description, price, pages, preview_paths, is_published, created_at")
          .in("id", valid);
        if (cancelled) return;
        if (error) {
          setProducts([]);
          return;
        }
        // 장바구니에 담은 순서 유지
        const byId = new Map(data.map((r) => [r.id, toProductFromRow(r)]));
        setProducts(valid.flatMap((id) => byId.get(id) ?? []));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { products, cart };
}
