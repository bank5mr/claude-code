import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { MOCK_PRODUCTS } from "@/lib/mock";
import { won } from "@/lib/format";
import { ProductForm } from "./ProductForm";
import { AdminProductList } from "./AdminProductList";

export const metadata: Metadata = { title: "관리" };

// 목업 주문 (6단계에서 orders 테이블로 교체)
const MOCK_ORDERS = [
  { orderId: "hk_20260926_0003", buyer: "kim@example.com", amount: 21500, status: "paid", at: "2026-09-26 10:12" },
  { orderId: "hk_20260925_0002", buyer: "lee@example.com", amount: 9000, status: "failed", at: "2026-09-25 21:40" },
  { orderId: "hk_20260925_0001", buyer: "park@example.com", amount: 11000, status: "pending", at: "2026-09-25 18:03" },
] as const;

const STATUS_LABEL = { paid: "결제 완료", pending: "대기", failed: "실패" } as const;

// TODO(6단계): 서버에서 is_admin 확인 후 아니면 차단
export default function AdminPage() {
  return (
    <div className="wrap pt-8">
      <PageTitle>관리</PageTitle>

      <section aria-labelledby="new-title" className="mt-8">
        <h2 id="new-title" className="text-item">
          자료 등록
        </h2>
        <div className="mt-4">
          <ProductForm />
        </div>
      </section>

      <section aria-labelledby="list-title" className="mt-12">
        <h2 id="list-title" className="mb-4 text-item">
          등록된 자료
        </h2>
        <AdminProductList products={MOCK_PRODUCTS} />
      </section>

      <section aria-labelledby="orders-title" className="mt-12">
        <h2 id="orders-title" className="mb-4 text-item">
          주문 목록
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-t border-ink text-left text-meta">
            <thead className="text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-medium">주문번호</th>
                <th className="py-2 pr-4 font-medium">구매자</th>
                <th className="py-2 pr-4 text-right font-medium">금액</th>
                <th className="py-2 pr-4 font-medium">상태</th>
                <th className="py-2 font-medium">일시</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((o) => (
                <tr key={o.orderId} className="border-b border-line">
                  <td className="py-3 pr-4 font-mono text-note">{o.orderId}</td>
                  <td className="py-3 pr-4">{o.buyer}</td>
                  <td className="py-3 pr-4 text-right">{won(o.amount)}</td>
                  <td
                    className={`py-3 pr-4 ${
                      o.status === "paid" ? "font-semibold text-grid" : o.status === "failed" ? "text-danger" : "text-muted"
                    }`}
                  >
                    {STATUS_LABEL[o.status]}
                  </td>
                  <td className="py-3 text-muted">{o.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
