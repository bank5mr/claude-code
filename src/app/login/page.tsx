import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="wrap pt-8">
      <div className="max-w-[400px]">
        <PageTitle>로그인</PageTitle>
        <p className="mt-2 text-muted">처음이면 로그인하면서 바로 가입돼.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
