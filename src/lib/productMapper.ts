import type { ProductRow } from "./database.types";
import { CATEGORIES, type Category, type Product } from "./types";
import { previewUrl } from "./storage";

// DB 행 → 화면용 타입. 표지는 첫 미리보기 이미지.
export function toProductFromRow(row: Omit<ProductRow, "file_path">): Product {
  const previewUrls = row.preview_paths.map(previewUrl);
  return {
    id: row.id,
    title: row.title,
    category: (CATEGORIES as readonly string[]).includes(row.category)
      ? (row.category as Category)
      : "문학",
    description: row.description,
    price: row.price,
    pages: row.pages,
    previewUrls,
    coverUrl: previewUrls[0] ?? null,
  };
}
