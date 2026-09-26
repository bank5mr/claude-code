"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";

// 이미 산 자료는 장바구니에서 빼고, 막 결제했으면 안내 토스트
export function ClearOwnedFromCart({ ownedIds }: { ownedIds: string[] }) {
  const cart = useCart();
  const toast = useToast();
  const params = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    ownedIds.forEach((id) => cart.remove(id));
    if (params.get("paid") === "1") toast.show("결제가 끝났어. 여기서 바로 내려받을 수 있어.");
  }, [ownedIds, cart, toast, params]);

  return null;
}
