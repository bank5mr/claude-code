import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

export default function NotFound() {
  return (
    <div className="wrap pt-8">
      <PageTitle>없는 페이지야.</PageTitle>
      <p className="mt-3 text-muted">주소를 다시 확인하거나 자료 목록으로 돌아가.</p>
      <Link href="/" className="btn btn-secondary mt-6">
        자료 목록으로
      </Link>
    </div>
  );
}
