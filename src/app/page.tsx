import { Hero } from "@/components/Hero";
import { ProductBrowser } from "@/components/ProductBrowser";
import { getPublishedProducts } from "@/lib/products";
import { getViewer } from "@/lib/auth";
import { getPurchasedProductIds } from "@/lib/orders";

export default async function HomePage() {
  const products = await getPublishedProducts();
  const viewer = await getViewer();
  const purchasedIds = viewer ? await getPurchasedProductIds(viewer.id) : [];

  return (
    <div className="wrap">
      <Hero />
      <ProductBrowser products={products} purchasedIds={purchasedIds} />
    </div>
  );
}
