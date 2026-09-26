import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { CheckoutForm } from "./CheckoutForm";
import { requireViewer } from "@/lib/guard";

export const metadata: Metadata = { title: "결제" };

export default async function CheckoutPage() {
  await requireViewer("/checkout");
  return (
    <div className="wrap pt-8">
      <PageTitle>결제</PageTitle>
      <div className="mt-6 max-w-[560px]">
        <CheckoutForm />
      </div>
    </div>
  );
}
