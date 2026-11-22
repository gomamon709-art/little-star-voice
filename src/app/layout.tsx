import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://little-star-voice.vercel.app";
const siteTitle = "Little Star Voice｜早産児・低出生体重児と家族を支える議員マップ";
const siteDescription =
  "早産児・低出生体重児（リトルベビー）とそのご家族を支える地方議員・国会議員の議会発言や取り組みを都道府県別にまとめたデータベースサイトです。公開されている議会会議録等をもとに、全国の支援の輪を可視化しています。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "早産児",
    "低出生体重児",
    "リトルベビー",
    "リトルベビーハンドブック",
    "議員",
    "議会",
    "議事録",
    "NICU",
    "小児医療",
    "Little Star Voice",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Little Star Voice",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/header.jpg",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/header.jpg"],
  },
  verification: {
    google: "QvEHO-0dVKKBpXYKohWc6wbezEx7VmX5R6huR9UjegE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Little Star Voice",
  alternateName: "リトルスターボイス",
  url: siteUrl,
  description: siteDescription,
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-white selection:bg-pink-200 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
