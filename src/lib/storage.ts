import { supabaseEnv } from "./env";

export const PREVIEW_BUCKET = "previews";
export const FILE_BUCKET = "files";

// 미리보기 경로 → 표시용 URL
// '/'로 시작하면 앱의 public 폴더(시드용 목업 이미지), 아니면 공개 버킷 URL
export function previewUrl(path: string): string {
  if (path.startsWith("/")) return path;
  const { url } = supabaseEnv();
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${url}/storage/v1/object/public/${PREVIEW_BUCKET}/${encoded}`;
}
