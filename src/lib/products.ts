import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "./types";
import { toProductFromRow as toProduct } from "./productMapper";

const COLUMNS = "id, title, category, description, price, pages, preview_paths, is_published, created_at";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 공개 자료 목록 (최신순). RLS가 is_published=true만 돌려준다.
export async function getPublishedProducts(): Promise<Product[]> {
  await connection(); // 요청마다 DB에서 새로 읽는다 (관리자 수정이 바로 보이게)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`자료 목록을 못 불러왔어: ${error.message}`);
  return (data ?? []).map(toProduct);
}

// 자료 1개. 없거나 비공개면 null
export async function getProduct(id: string): Promise<Product | null> {
  await connection();
  if (!UUID_RE.test(id)) return null; // 잘못된 id로 DB 오류가 나지 않게
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`자료를 못 불러왔어: ${error.message}`);
  return data ? toProduct(data) : null;
}
