"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  onOpenFilter?: () => void;
}

export function Header({ onOpenFilter }: HeaderProps) {
  return (
    <header className="relative z-10 pt-10 pb-4 text-center max-w-4xl mx-auto px-4 flex flex-col items-center">
      {/* 1. Pill badge: little star voice */}
      <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/70 backdrop-blur-xs text-slate-600 text-xs tracking-wider border border-purple-100 shadow-2xs mb-3.5">
        little star voice
      </div>

      {/* 2. Main title: ★ 議員マップ ★ */}
      <h1 className="text-3xl sm:text-4xl md:text-[40px] font-black text-slate-800 tracking-tight flex items-center justify-center gap-2 mb-3">
        <span className="text-amber-400 select-none text-2xl sm:text-3xl">★</span>
        <span>議員マップ</span>
        <span className="text-amber-400 select-none text-2xl sm:text-3xl">★</span>
      </h1>

      {/* 3. Subtitle */}
      <p className="text-xs sm:text-[13px] text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4 font-normal">
        小さな命と、その家族のために、議会で声を届けてくれている議員さんを紹介します。
      </p>

      {/* 4. Notice banner */}
      <div className="bg-white/80 backdrop-blur-xs border border-purple-100/80 rounded-xl px-5 py-2.5 max-w-xl w-full mx-auto mb-4 shadow-2xs text-xs text-slate-600 text-center">
        このサイトは少しずつアップデート中です。議員さんも順次追加していきます。
      </div>

      {/* 5. 3-Step Guide (Capsule with pills connected by arrows, matching screenshot) */}
      <div className="bg-white/60 backdrop-blur-xs border border-purple-100/90 rounded-2xl px-4 py-2 max-w-2xl w-full mx-auto mb-5 shadow-2xs">
        <div className="flex flex-row items-center justify-center gap-2 text-xs text-slate-600 flex-wrap">
          {/* Step 1 pill */}
          <button
            type="button"
            onClick={onOpenFilter}
            className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-2xs cursor-pointer text-xs"
          >
            「絞り込み」をひらく
          </button>

          <span className="text-slate-400 font-bold select-none text-xs">→</span>

          {/* Step 2 pill */}
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs text-xs">
            条件をえらぶ
          </span>

          <span className="text-slate-400 font-bold select-none text-xs">→</span>

          {/* Step 3 pill */}
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs text-xs">
            議員カードが表示されます
          </span>
        </div>
      </div>

      {/* 6. Action buttons (Side-by-side, matching screenshot colors) */}
      <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mb-2">
        {/* X Follow button: Purple/Lavender #8370AF */}
        <a
          href="https://x.com/lsvsince2026"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#8370AF] hover:bg-[#7663A3] text-white font-medium text-xs sm:text-sm shadow-sm transition-all duration-200 shrink-0"
        >
          {/* Constrained SVG icon to prevent any explosion */}
          <svg
            width="14"
            height="14"
            style={{ width: "14px", height: "14px", display: "inline-block" }}
            className="fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>@lsvsince2026 をフォロー</span>
        </a>

        {/* System intro button: Pale Mint Green / White */}
        <Link
          href="/about"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#D7F5ED] hover:bg-[#C9F0E6] text-[#196B54] border border-[#BCE8DC] font-semibold text-xs sm:text-sm shadow-2xs transition-all duration-200 shrink-0"
        >
          <span className="text-amber-500 text-xs">★</span>
          <span>制度紹介はこちら →</span>
        </Link>
      </div>

      {/* 7. Note */}
      <p className="text-[11px] text-slate-400 font-normal mt-1">
        紹介カードはXで連載中です
      </p>
    </header>
  );
}
