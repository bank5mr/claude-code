import { Hero } from "@/components/Hero";
import { ProductBrowser } from "@/components/ProductBrowser";
import { MOCK_PRODUCTS, MOCK_PURCHASED_IDS } from "@/lib/mock";

export default function HomePage() {
  return (
    <div className="wrap">
      <Hero />
      <ProductBrowser products={MOCK_PRODUCTS} purchasedIds={[...MOCK_PURCHASED_IDS]} />
    </div>
  );
}
