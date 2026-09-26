import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "장바구니" };

export default function CartPage() {
  return (
    <div className="wrap pt-8">
      <PageTitle>장바구니</PageTitle>
      <div className="mt-6 max-w-[640px]">
        <CartView />
      </div>
    </div>
  );
}
