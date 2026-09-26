// 분류 목록 (필터 칩 순서와 동일)
export const CATEGORIES = ["문학", "비문학", "문법", "화법과 작문"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  title: string;
  category: Category;
  description: string;
  price: number;
  pages: number;
  // 공개 버킷의 미리보기 이미지 경로 (1~3장)
  previewUrls: string[];
  // 표지 이미지 (없으면 노트 줄무늬 썸네일)
  coverUrl?: string | null;
};
