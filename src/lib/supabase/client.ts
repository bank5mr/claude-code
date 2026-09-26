import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

// 브라우저용 클라이언트. publishable key만 쓰며 RLS가 허용하는 것만 읽을 수 있다.
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
