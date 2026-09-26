import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "환불 규정" };

// TODO: 내용 작성 (placeholder)
export default function Page() {
  return (
    <LegalPage title="환불 규정">
      <p>제1조 (TODO)</p>
      <p>제2조 (TODO)</p>
    </LegalPage>
  );
}
