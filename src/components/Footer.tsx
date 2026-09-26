import Link from "next/link";

// 푸터: 법적 페이지 링크 + 사업자 정보 자리
export function Footer() {
  return (
    <footer
      className="mt-16 border-t border-line text-note text-muted"
      style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}
    >
      <div className="wrap pt-8">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <Link href="/terms" className="inline-flex min-h-10 items-center hover:text-ink">
              이용약관
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="inline-flex min-h-10 items-center font-semibold text-ink"
            >
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link href="/refund" className="inline-flex min-h-10 items-center hover:text-ink">
              환불 규정
            </Link>
          </li>
        </ul>
        {/* TODO: 사업자 정보 입력 (전자상거래법상 표시 의무 항목) */}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          <dt>상호</dt>
          <dd>한칸 (TODO)</dd>
          <dt>대표자</dt>
          <dd>TODO</dd>
          <dt>사업자등록번호</dt>
          <dd>000-00-00000 (TODO)</dd>
          <dt>통신판매업 신고번호</dt>
          <dd>TODO</dd>
          <dt>주소</dt>
          <dd>TODO</dd>
          <dt>문의</dt>
          <dd>TODO</dd>
        </dl>
        <p className="mt-4">© 한칸</p>
      </div>
    </footer>
  );
}
