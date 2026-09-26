/* eslint-disable @next/next/no-img-element -- 목업 SVG. 2단계에서 next/image로 교체 */

// 썸네일: 노트 줄무늬 바탕, 표지 이미지가 있으면 그걸 표시. 모서리 0.
export function Thumb({ src, className = "" }: { src?: string | null; className?: string }) {
  return (
    <div className={`note-lines-12 overflow-hidden border border-line ${className}`}>
      {src && <img src={src} alt="" className="size-full object-cover object-top" />}
    </div>
  );
}
