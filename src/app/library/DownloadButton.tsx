"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

// 내려받기 중엔 "준비 중…" + 비활성
export function DownloadButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        // TODO(5단계): /api/download/[productId] → 60초 signed URL로 이동
        await new Promise((r) => setTimeout(r, 1200));
        setBusy(false);
        toast.show(`내려받기는 5단계에서 연결돼. (${productId})`);
      }}
    >
      {busy ? "준비 중…" : "내려받기"}
    </button>
  );
}
