// 12500 → "12,500원"
export function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
