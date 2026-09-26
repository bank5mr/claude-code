import Image from "next/image";

// 썸네일: 노트 줄무늬 바탕, 표지 이미지가 있으면 그걸 표시. 모서리 0.
export function Thumb({ src, className = "" }: { src?: string | null; className?: string }) {
  return (
    <div className={`note-lines-12 relative overflow-hidden border border-line ${className}`}>
      {src && <Image src={src} alt="" fill sizes="72px" className="object-cover object-top" />}
    </div>
  );
}
