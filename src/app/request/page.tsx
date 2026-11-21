import { Suspense } from "react";
import { RequestFormClient } from "@/components/RequestFormClient";
import Link from "next/link";

export const metadata = {
  title: "情報の訂正・削除依頼 / 新しい発言の情報提供｜Little Star Voice",
  description:
    "Little Star Voice（早産児・低出生体重児と家族を支える議員マップ）への情報の訂正・更新、掲載削除、新しい発言の情報提供受付フォームです。",
};

export default function RequestPage() {
  return (
    <div className="min-h-screen relative text-slate-800 pb-20 selection:bg-pink-200 selection:text-purple-900 flex flex-col items-center">
      {/* 背景（header.jpg + 白グラデーション） */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url('/header.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* ヘッダーエリア */}
        <header className="pt-10 pb-6 text-center max-w-2xl mx-auto px-4 flex flex-col items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/80 backdrop-blur-xs text-slate-600 hover:text-purple-700 text-xs tracking-wider border border-purple-100 shadow-2xs mb-3.5 transition-colors"
          >
            <span>←</span>
            <span>little star voice トップへ戻る</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2.5">
            情報の訂正・削除依頼 / 情報提供
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal max-w-xl">
            当サイトは、小さく生まれた赤ちゃんとそのご家族を支える取り組みを広く届けるために運営しております。掲載情報の修正・削除希望や、新たな発言情報がございましたら、下記フォームよりお寄せください。
          </p>
        </header>

        {/* フォーム本体（Suspenseでラップしてクエリパラメータを安全に読み込み） */}
        <main className="w-full max-w-2xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm text-center">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full mb-3" />
                <p className="text-xs text-slate-500">フォームを読み込み中...</p>
              </div>
            }
          >
            <RequestFormClient />
          </Suspense>

          {/* フッター補足 */}
          <footer className="mt-8 text-center text-xs text-slate-400">
            <p>little star voice（@lsvsince2026）</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
