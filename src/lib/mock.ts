import type { Product } from "./types";

// 1단계 정적 목업용 데이터. 2단계에서 Supabase로 교체한다.
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "현대시 핵심 작품 30선 정리 노트",
    category: "문학",
    description:
      "교과서와 모의고사에 자주 나오는 현대시 30편을 화자, 정서, 표현법 중심으로 한 쪽씩 정리했어. 작품마다 기출 선지 분석을 붙였어.",
    price: 12500,
    pages: 18,
    previewUrls: ["/mock/preview-1.svg", "/mock/preview-2.svg", "/mock/preview-3.svg"],
    coverUrl: "/mock/preview-1.svg",
  },
  {
    id: "p2",
    title: "고전소설 인물 관계도와 줄거리 요약",
    category: "문학",
    description: "자주 출제되는 고전소설 12편의 인물 관계도와 장면별 줄거리를 정리했어.",
    price: 9000,
    pages: 24,
    previewUrls: ["/mock/preview-2.svg", "/mock/preview-3.svg"],
  },
  {
    id: "p3",
    title: "비문학 독해 구조도 그리기 연습장",
    category: "비문학",
    description:
      "과학·기술, 인문, 사회 지문을 문단 구조도로 옮기는 연습장이야. 예시 지문 10개와 해설 구조도가 들어 있어.",
    price: 11000,
    pages: 32,
    previewUrls: ["/mock/preview-3.svg"],
    coverUrl: "/mock/preview-3.svg",
  },
  {
    id: "p4",
    title: "경제 지문 배경지식 한 장 요약",
    category: "비문학",
    description: "금리, 환율, 보험처럼 경제 지문에 자주 나오는 개념을 그림과 함께 짧게 정리했어.",
    price: 6000,
    pages: 10,
    previewUrls: ["/mock/preview-1.svg", "/mock/preview-2.svg"],
  },
  {
    id: "p5",
    title: "음운 변동 규칙 총정리",
    category: "문법",
    description: "교체, 탈락, 첨가, 축약을 표 하나로 묶고 헷갈리는 예외를 따로 모았어.",
    price: 7500,
    pages: 14,
    previewUrls: ["/mock/preview-2.svg"],
  },
  {
    id: "p6",
    title: "문장 성분과 안긴문장 판별 노트",
    category: "문법",
    description: "문장 성분부터 안긴문장 종류까지, 기출 예문으로 판별 순서를 연습해.",
    price: 8000,
    pages: 16,
    previewUrls: ["/mock/preview-3.svg", "/mock/preview-1.svg"],
  },
];

// 목업: 이미 구매한 자료 id (5단계에서 orders로 교체)
export const MOCK_PURCHASED_IDS = new Set(["p3"]);

export function getMockProduct(id: string) {
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}
