"use client";

import { useId, useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// 돌아올 주소: /auth/callback 에서 세션을 만든 뒤 next로 보낸다
function callbackUrl(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

// Supabase 오류 → 무엇이 일어났고 무엇을 하면 되는지
function explain(error: AuthError, kind: "email" | "google"): string {
  if (error.status === 429 || error.code === "over_email_send_rate_limit") {
    return "메일을 너무 자주 요청했어. 1분쯤 뒤에 다시 받아 줘.";
  }
  if (kind === "google") {
    return "구글 로그인을 시작하지 못했어. 이메일 로그인으로 들어와 줘.";
  }
  return "로그인 링크를 보내지 못했어. 이메일 주소를 확인하고 다시 받아 줘.";
}

export function LoginForm({ next }: { next: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border-t border-ink pt-4" role="status">
        <p>{email}로 로그인 링크를 보냈어. 메일함에서 링크를 눌러 줘.</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-4"
          onClick={() => setSent(false)}
        >
          다른 이메일로 받기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("이메일 형식이 아니야. name@example.com처럼 적어 줘.");
            return;
          }
          setError(null);
          setBusy("email");
          // 매직링크 메일 보내기 (처음이면 자동 가입)
          const { error } = await createClient().auth.signInWithOtp({
            email,
            options: { emailRedirectTo: callbackUrl(next) },
          });
          setBusy(null);
          if (error) setError(explain(error, "email"));
          else setSent(true);
        }}
        className="flex flex-col gap-3"
      >
        <div>
          <label htmlFor={id} className="field-label">
            이메일
          </label>
          <input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
          />
          {error && (
            <p id={`${id}-err`} className="field-error">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy !== null}>
          {busy === "email" ? "보내는 중…" : "로그인 링크 받기"}
        </button>
      </form>
      <div className="flex items-center gap-3 text-note text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
      </div>
      <div>
        <button
          type="button"
          className="btn btn-secondary w-full"
          disabled={busy !== null}
          onClick={async () => {
            setGoogleError(null);
            setBusy("google");
            // 구글 동의 화면으로 이동. 성공하면 브라우저가 페이지를 떠난다
            const { error } = await createClient().auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: callbackUrl(next) },
            });
            if (error) {
              setBusy(null);
              setGoogleError(explain(error, "google"));
            }
          }}
        >
          {busy === "google" ? "구글로 이동 중…" : "구글로 계속하기"}
        </button>
        {googleError && (
          <p className="field-error" role="alert">
            {googleError}
          </p>
        )}
      </div>
    </div>
  );
}
