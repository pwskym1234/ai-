import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI 영양 플래너 프로토타입",
  description: "Next.js 와이어프레임 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
