import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeNext";

// 로그인 링크/구글 로그인이 돌아오는 곳.
//  - token_hash + type : 메일 링크 (다른 기기에서 열어도 동작)
//  - code              : 구글 로그인, 또는 기본 메일 템플릿(PKCE, 같은 브라우저에서만)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  // 요청이 들어온 주소를 기준으로 되돌린다 (같은 사이트 안에서만 이동)
  const target = request.nextUrl.clone();
  target.search = "";
  if (ok) {
    // next에 쿼리가 있으면 그대로 살린다
    const [path, query] = next.split("?");
    target.pathname = path;
    if (query) target.search = `?${query}`;
  } else {
    target.pathname = "/login";
    target.search = `?error=link&next=${encodeURIComponent(next)}`;
  }
  return NextResponse.redirect(target);
}
