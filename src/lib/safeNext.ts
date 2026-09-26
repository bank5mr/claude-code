// 로그인 뒤 돌아갈 경로. 외부 사이트로 튀는 오픈 리다이렉트를 막기 위해
// 같은 사이트의 절대 경로('/...')만 허용하고 '//', '/\' 로 시작하는 값은 버린다.
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
