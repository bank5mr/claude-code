import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle } from "@/components/PageTitle";
import { ProductList, ProductRow } from "@/components/ProductRow";
import { AccountBar } from "@/components/AccountBar";
import { requireViewer } from "@/lib/guard";
import { getLibraryProducts } from "@/lib/orders";
import { DownloadButton } from "./DownloadButton";
import { ClearOwnedFromCart } from "./ClearOwnedFromCart";

export const metadata: Metadata = { title: "내 자료" };

export default async function LibraryPage() {
  const viewer = await requireViewer("/library");
  // 결제 완료(paid)된 주문의 자료만
  const items = await getLibraryProducts(viewer.id);

  return (
    <div className="wrap pt-8">
      <PageTitle>내 자료</PageTitle>
      <AccountBar email={viewer.email} />
      <Suspense>
        <ClearOwnedFromCart ownedIds={items.map((p) => p.id)} />
      </Suspense>
      <div className="mt-6">
        {items.length === 0 ? (
          <div className="border-t border-ink py-12">
            <p className="text-muted">아직 구매한 자료가 없어. 자료 탭에서 골라 봐.</p>
            <Link href="/" className="btn btn-secondary mt-4">
              자료 보러 가기
            </Link>
          </div>
        ) : (
          <ProductList>
            {items.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                showPrice={false}
                action={<DownloadButton productId={p.id} />}
              />
            ))}
          </ProductList>
        )}
      </div>
    </div>
  );
}
