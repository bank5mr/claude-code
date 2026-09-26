import "server-only";
import { createClient } from "@supabase/supabase-js";

// secret key(service_role) 클라이언트. RLS를 우회하므로 서버에서만, 권한 확인 뒤에만 쓴다.
// "server-only" 덕분에 클라이언트 컴포넌트에서 import하면 빌드가 실패한다.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("SUPABASE_SECRET_KEY가 없어. .env.local에 넣어 줘.");
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
