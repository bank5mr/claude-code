import type { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { getViewer } from "@/lib/auth";

// 한글 글리프는 Google이 unicode-range 조각으로 나눠 제공한다.
// 'korean' subset 옵션이 없어서 preload는 끄고, 필요한 조각만 브라우저가 받게 둔다.
const gowun = Gowun_Batang({
  weight: "700",
  subsets: ["latin"],
  preload: false,
  variable: "--font-gowun",
});
const plex = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: { default: "한칸", template: "%s · 한칸" },
  description: "수업 들으며 직접 정리한 국어 자료를 파일로 판매해.",
};

// iOS 노치 대응: viewport-fit=cover (safe-area 패딩은 CSS에서 처리)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F3" },
    { media: "(prefers-color-scheme: dark)", color: "#15181B" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();

  return (
    <html lang="ko" className={`${gowun.variable} ${plex.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>
          <Header viewer={viewer ? { isAdmin: viewer.isAdmin } : null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
