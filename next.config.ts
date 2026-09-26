import type { NextConfig } from "next";

// 미리보기 이미지는 Supabase 공개 버킷(previews)에서만 받아온다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/previews/**`)]
      : [],
  },
};

export default nextConfig;
