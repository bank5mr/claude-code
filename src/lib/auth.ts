import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
};

// 현재 로그인 사용자. 한 요청 안에서는 한 번만 조회한다 (React cache).
// getClaims()는 토큰 서명을 검증하므로 쿠키 값을 그대로 믿지 않는다.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  // 관리자 여부는 토큰이 아니라 DB(profiles)에서 확인한다 (RLS: 본인 행만 읽힘)
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_admin")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    name: profile?.name ?? null,
    isAdmin: profile?.is_admin === true,
  };
});
