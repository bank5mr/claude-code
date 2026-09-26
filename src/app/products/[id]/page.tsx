import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CartButton } from "@/components/CartButton";
import { won } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { getViewer } from "@/lib/auth";
import { getPurchasedProductIds } from "@/lib/orders";

export async function generateMetadata(props: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProduct(id);
  return { title: product?.title ?? "자료" };
}

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const product = await getProduct(id);
  if (!product) notFound();

  const viewer = await getViewer();
  const purchased = viewer ? (await getPurchasedProductIds(viewer.id)).includes(product.id) : false;
  const previews = product.previewUrls;

  return (
    <div className="wrap pt-8 max-sm:pb-24">
      {/* 상단: 분류 · 쪽수, 자료명, 설명 */}
      <header>
        <p className="text-meta text-muted">
          <span className="font-semibold text-grid">{product.category}</span> · {product.pages}쪽
        </p>
        <h1 className="mt-1 text-title">{product.title}</h1>
        <p className="measure mt-3">{product.description}</p>
      </header>

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_220px]">
        {/* 미리보기: 노트 줄 위에 이미지를 세로로, 마지막 장은 아래로 페이드아웃 */}
        <section aria-labelledby="preview-title">
          <h2 id="preview-title" className="sr-only">
            미리보기
          </h2>
          <div className="note-lines-28 border border-line p-7 max-sm:p-4">
            <ul className="flex flex-col gap-7">
              {previews.map((src, i) => {
                const last = i === previews.length - 1;
                return (
                  <li key={src + i} className="relative">
                    <Image
                      src={src}
                      alt={`${product.title} 미리보기 ${i + 1}쪽`}
                      width={840}
                      height={1188}
                      sizes="(max-width: 600px) 100vw, 700px"
                      preload={i === 0}
                      className="block h-auto w-full border border-line"
                    />
                    {last && (
                      <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-1/2"
                        style={{
                          background: "linear-gradient(to bottom, transparent, var(--surface) 92%)",
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="mt-2 text-note text-muted">
            전체 {product.pages}쪽 중 {previews.length}쪽 미리보기야.
          </p>
        </section>

        {/* 데스크톱: 우측 정보 영역 */}
        <aside className="max-sm:hidden">
          <div className="sticky top-[84px] border-t border-ink pt-4">
            <p className="text-meta text-muted">가격</p>
            <p className="text-item font-semibold">{won(product.price)}</p>
            <CartButton
              productId={product.id}
              purchased={purchased}
              size="md"
              label="장바구니 담기"
              className="mt-4 w-full"
            />
          </div>
        </aside>
      </div>

      {/* 모바일: 하단 고정 바 */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <p className="text-item font-semibold">{won(product.price)}</p>
          <CartButton
            productId={product.id}
            purchased={purchased}
            size="md"
            label="장바구니 담기"
          />
        </div>
      </div>
    </div>
  );
}
