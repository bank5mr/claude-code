import Link from "next/link";

// 로고: 28px 원고지 칸 안에 "한" + 옆에 "한칸"
export function Logo() {
  return (
    <Link href="/" className="flex min-h-10 items-center gap-2" aria-label="한칸 처음으로">
      <span
        aria-hidden
        className="grid size-7 place-items-center font-serif text-[17px] leading-none font-bold text-ink"
        style={{ border: "1.5px solid var(--grid)" }}
      >
        한
      </span>
      {/* 360px 미만의 아주 좁은 화면에선 칸 로고만 */}
      <span aria-hidden className="font-serif text-[20px] leading-none font-bold max-[359px]:hidden">
        한칸
      </span>
    </Link>
  );
}
