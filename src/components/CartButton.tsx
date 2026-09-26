"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useToast } from "./Toast";

// 버튼 상태: 담기 / 담김(비활성) / 구매함(보조 버튼, 내 자료로 이동)
export function CartButton({
  productId,
  purchased,
  size = "sm",
  label = "담기",
  className = "",
}: {
  productId: string;
  purchased: boolean;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const cart = useCart();
  const toast = useToast();
  const sizeClass = `${size === "sm" ? "btn-sm" : ""} ${className}`;

  if (purchased) {
    return (
      <Link href="/library" className={`btn btn-secondary ${sizeClass}`}>
        구매함
      </Link>
    );
  }
  const inCart = cart.has(productId);
  return (
    <button
      type="button"
      className={`btn btn-primary ${sizeClass}`}
      disabled={inCart}
      onClick={() => {
        cart.add(productId);
        toast.show("장바구니에 담았어.");
      }}
    >
      {inCart ? "담김" : label}
    </button>
  );
}
