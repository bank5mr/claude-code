// 메인 히어로: 8열 × 2행 원고지. 첫 줄에 한 글자씩, 둘째 줄은 빈칸.
const TEXT = [..."직접만든국어자료"];
const COLS = 8;

export function Hero() {
  const cells = Array.from({ length: COLS * 2 }, (_, i) => TEXT[i] ?? "");
  return (
    <section className="pt-12 pb-8 max-sm:pt-8">
      <h1 className="sr-only">한칸, 직접 만든 국어 자료</h1>
      <div
        aria-hidden
        className="grid w-full max-w-[480px] grid-cols-8"
        // 바깥 선은 컨테이너가, 안쪽 선은 각 칸의 오른쪽·아래 선이 맡는다
        style={{ borderTop: "1.5px solid var(--grid)", borderLeft: "1.5px solid var(--grid)" }}
      >
        {cells.map((ch, i) => (
          <span
            key={i}
            className="grid aspect-square place-items-center font-serif font-bold leading-none"
            style={{
              borderRight: "1.5px solid var(--grid)",
              borderBottom: "1.5px solid var(--grid)",
              fontSize: "clamp(22px, 6vw, 40px)",
            }}
          >
            {ch && (
              <span className="hero-char" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            )}
          </span>
        ))}
      </div>
      <p className="measure mt-5 text-muted">
        수업 들으며 직접 정리한 국어 자료를 파일로 판매해. 미리보기로 확인하고, 결제하면 내
        자료에서 바로 받을 수 있어.
      </p>
    </section>
  );
}
