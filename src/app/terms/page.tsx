import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "이용약관" };

// TODO: 내용 작성 (placeholder)
export default function Page() {
  return (
    <LegalPage title="이용약관">
      <p>제1조 (TODO)</p>
      <p>제2조 (TODO)</p>
    </LegalPage>
  );
}
