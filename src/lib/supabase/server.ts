import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/env";

// 서버 컴포넌트/라우트용 클라이언트. 로그인 사용자의 쿠키로 요청하므로 RLS가 그대로 적용된다.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서 호출되면 쿠키를 쓸 수 없다. 세션 갱신은 proxy가 맡는다 (3단계).
        }
      },
    },
  });
}
