import { PageTitle } from "./PageTitle";

// 법적 페이지 공통 틀. 본문은 실제 내용으로 교체해야 한다.
export function LegalPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="wrap pt-8">
      <PageTitle>{title}</PageTitle>
      <p className="mt-4 border border-dashed border-line px-3 py-2 text-meta text-muted">
        TODO: 실제 {title} 내용으로 바꿔야 해. 지금은 자리만 잡아 둔 상태야.
      </p>
      <div className="measure mt-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}
