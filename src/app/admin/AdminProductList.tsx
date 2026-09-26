"use client";

import { useState } from "react";
import { Dialog } from "@/components/Dialog";
import { ProductList, ProductRow } from "@/components/ProductRow";
import { useToast } from "@/components/Toast";
import type { Product } from "@/lib/types";

export function AdminProductList({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [target, setTarget] = useState<Product | null>(null);
  const toast = useToast();

  return (
    <>
      <ProductList>
        {items.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            action={
              <div className="flex gap-2">
                {/* TODO(6단계): 수정 폼 연결 */}
                <button type="button" className="btn btn-secondary btn-sm">
                  수정
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTarget(p)}
                >
                  삭제
                </button>
              </div>
            }
          />
        ))}
      </ProductList>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title="이 자료를 삭제할까?"
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setTarget(null)}>
              취소
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (!target) return;
                // TODO(6단계): 서버에서 삭제
                setItems((prev) => prev.filter((p) => p.id !== target.id));
                toast.show("자료를 삭제했어.");
                setTarget(null);
              }}
            >
              삭제
            </button>
          </>
        }
      >
        <p>‘{target?.title}’을 목록에서 지워. 되돌릴 수 없어.</p>
      </Dialog>
    </>
  );
}
