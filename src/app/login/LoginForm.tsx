"use client";

import { useId, useState } from "react";

// 1단계 목업: 이메일 매직링크 + 구글 (3단계에서 Supabase Auth 연결)
export function LoginForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="border-t border-ink pt-4" role="status">
        {email}로 로그인 링크를 보냈어. 메일함에서 링크를 눌러 줘.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("이메일 형식이 아니야. name@example.com처럼 적어 줘.");
            return;
          }
          setError(null);
          setSent(true); // TODO(3단계): signInWithOtp
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
        <button type="submit" className="btn btn-primary w-full">
          로그인 링크 받기
        </button>
      </form>
      <div className="flex items-center gap-3 text-note text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
      </div>
      {/* TODO(3단계): signInWithOAuth({ provider: 'google' }) */}
      <button type="button" className="btn btn-secondary w-full">
        구글로 계속하기
      </button>
    </div>
  );
}
