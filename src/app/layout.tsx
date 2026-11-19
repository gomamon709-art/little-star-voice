import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Star Voice｜早産児・低出生体重児と家族を支える議員マップ",
  description: "小さな命と、その家族のために、議会で声を届けてくれている議員さんを紹介しています。",
  openGraph: {
    title: "Little Star Voice｜早産児・低出生体重児と家族を支える議員マップ",
    description: "小さな命と、その家族のために、議会で声を届けてくれている議員さんを紹介しています。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Star Voice｜早産児・低出生体重児と家族を支える議員マップ",
    description: "小さな命と、その家族のために、議会で声を届けてくれている議員さんを紹介しています。",
  },
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
