"use client";

import React, { useEffect } from "react";
import { Politician } from "@/data/politicians";

interface PoliticianModalProps {
  politician: Politician | null;
  onClose: () => void;
}

export function PoliticianModal({ politician, onClose }: PoliticianModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (politician) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [politician, onClose]);

  if (!politician) return null;

  const getThemeClass = (theme: string) => {
    switch (theme) {
      case "早産児支援":
        return "bg-pink-100 text-pink-700";
      case "母乳バンク":
        return "bg-sky-100 text-sky-700";
      case "付き添い入院":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          aria-label="閉じる"
        >
          ✕
        </button>

        {/* Top badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
            {politician.cardNo}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {politician.region}
          </span>
        </div>

        {/* Politician Name & Title */}
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {politician.name}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#8370AF] mt-1">
            {politician.title}
          </p>
        </div>

        {/* Division & Date Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100 mb-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-purple-600 font-bold">区分：</span>
            <span className="text-slate-700 font-medium">
              {politician.divisionText}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-purple-600 font-bold">質問日：</span>
            <span className="text-slate-700 font-medium">
              {politician.questionDate}
            </span>
          </div>
        </div>

        {/* Themes */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            テーマ
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {politician.themes.map((theme) => (
              <span
                key={theme}
                className={`px-3 py-0.5 rounded-full text-xs font-medium ${getThemeClass(
                  theme
                )}`}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            質問・活動内容
          </h4>
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {politician.summary}
          </div>
        </div>

        {/* Source link */}
        {politician.sourceUrl && (
          <div className="mb-5 bg-purple-50/40 p-3 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">公式会議録・情報出典：</span>
            <a
              href={politician.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8370AF] hover:underline font-bold inline-flex items-center gap-1"
            >
              {politician.sourceTitle ?? "議事録を開く"} ↗
            </a>
          </div>
        )}

        {/* Follow-ups Section in Modal */}
        {politician.followUps && politician.followUps.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <span>✨</span>
              <span>続報・その後の議会発言（{politician.followUps.length}件）</span>
            </h4>
            <div className="space-y-3">
              {politician.followUps.map((fu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 via-slate-50/40 to-pink-50/30 border border-purple-100 shadow-2xs"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <span className="font-bold text-[#8370AF] text-xs sm:text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8370AF]" />
                      <span>{fu.committee || "議会質問・発言"}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                      {fu.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-2.5">
                    {fu.summary}
                  </p>

                  {fu.sourceUrl && (
                    <div className="text-right">
                      <a
                        href={fu.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8370AF] hover:underline font-bold inline-flex items-center gap-1 text-xs"
                      >
                        <span>出典：{fu.sourceLabel || "公式議事録を開く"}</span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions in Modal */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={politician.xPostUrl || "https://x.com/lsvsince2026"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#8370AF] text-white font-medium text-xs shadow-sm hover:brightness-105 transition-all"
          >
            <svg
              width="14"
              height="14"
              style={{ width: "14px", height: "14px", display: "inline-block" }}
              className="fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Xで紹介カードを見る</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
