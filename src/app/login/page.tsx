import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { getViewer } from "@/lib/auth";
import { safeNext } from "@/lib/safeNext";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  const linkError = sp.error === "link";

  // 이미 로그인했으면 가려던 곳으로
  if (await getViewer()) redirect(next);

  return (
    <div className="wrap pt-8">
      <div className="max-w-[400px]">
        <PageTitle>로그인</PageTitle>
        <p className="mt-2 text-muted">처음이면 로그인하면서 바로 가입돼.</p>
        {linkError && (
          <p className="mt-4 text-meta text-danger" role="alert">
            로그인 링크가 만료됐거나 이미 쓰였어. 아래에서 새 링크를 받아 줘.
          </p>
        )}
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
