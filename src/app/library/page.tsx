import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { ProductList, ProductRow } from "@/components/ProductRow";
import { MOCK_PRODUCTS, MOCK_PURCHASED_IDS } from "@/lib/mock";
import { DownloadButton } from "./DownloadButton";
import { AccountBar } from "@/components/AccountBar";
import { requireViewer } from "@/lib/guard";

export const metadata: Metadata = { title: "내 자료" };

export default async function LibraryPage() {
  const viewer = await requireViewer("/library");
  // TODO(5단계): 로그인 사용자의 paid 주문에서 가져온다
  const items = MOCK_PRODUCTS.filter((p) => MOCK_PURCHASED_IDS.has(p.id));

  return (
    <div className="wrap pt-8">
      <PageTitle>내 자료</PageTitle>
      <AccountBar email={viewer.email} />
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
