import { signOut } from "@/app/auth/actions";

// 내 자료 상단: 누구로 로그인했는지 + 로그아웃
export function AccountBar({ email }: { email: string | null }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted">
      <span>{email ?? "이 계정"}으로 로그인했어.</span>
      <form action={signOut}>
        <button type="submit" className="btn btn-secondary btn-sm">
          로그아웃
        </button>
      </form>
    </div>
  );
}
