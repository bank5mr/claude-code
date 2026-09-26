import { Hero } from "@/components/Hero";
import { ProductBrowser } from "@/components/ProductBrowser";
import { getPublishedProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getPublishedProducts();
  // TODO(5단계): 로그인 사용자의 구매 자료 id
  const purchasedIds: string[] = [];

  return (
    <div className="wrap">
      <Hero />
      <ProductBrowser products={products} purchasedIds={purchasedIds} />
    </div>
  );
}
