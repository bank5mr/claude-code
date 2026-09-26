import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { getViewer } from "@/lib/auth";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "장바구니" };

export default async function CartPage() {
  const viewer = await getViewer();
  return (
    <div className="wrap pt-8">
      <PageTitle>장바구니</PageTitle>
      <div className="mt-6 max-w-[640px]">
        <CartView loggedIn={viewer !== null} />
      </div>
    </div>
  );
}
