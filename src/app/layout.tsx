import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "little star voice ★ 議員マップ ★",
  description: "小さな命と、その家族のために、議会で声を届けてくれている議員さんを紹介しています。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-white selection:bg-pink-200 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
