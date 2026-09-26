// DB 행 타입 (supabase/migrations와 맞춰 둔다)
export type ProductRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  pages: number;
  file_path: string | null;
  preview_paths: string[];
  is_published: boolean;
  created_at: string;
};
