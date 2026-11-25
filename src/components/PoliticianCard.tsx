"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Politician } from "@/data/politicians";

interface PoliticianCardProps {
  politician: Politician;
  onSelect: (politician: Politician) => void;
}

export function PoliticianCard({ politician, onSelect }: PoliticianCardProps) {
  const [isFollowUpsOpen, setIsFollowUpsOpen] = useState(false);
  const hasFollowUps = Boolean(politician.followUps && politician.followUps.length > 0);
  const latestFollowUp = hasFollowUps
    ? politician.followUps![politician.followUps!.length - 1]
    : null;

  // Theme badge color style
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
    <article
      onClick={() => onSelect(politician)}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-purple-100/90 hover:border-purple-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top row: Name & Card Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight group-hover:text-[#8370AF] transition-colors">
            {politician.name}
          </h3>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            {politician.cardNo}
          </span>
        </div>

        {/* Title / Party & District */}
        <p className="text-xs text-slate-600 font-normal mb-1.5 leading-snug">
          {politician.title}
        </p>

        {/* Division: e.g. 国会｜国会（衆議院） */}
        <p className="text-xs text-slate-500 font-normal mb-1">
          {politician.divisionText}
        </p>

        {/* Question Date: e.g. 質問：2026年3月9日 */}
        <p className="text-xs text-slate-500 font-normal mb-2.5">
          質問：{politician.questionDate}
        </p>

        {/* Theme Badges & Follow-up Badge */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {politician.themes.map((theme) => (
            <span
              key={theme}
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getThemeClass(
                theme
              )}`}
            >
              {theme}
            </span>
          ))}

          {hasFollowUps && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
              <span>✨</span>
              <span>続報あり（{politician.followUps!.length}件）</span>
            </span>
          )}
        </div>

        {/* Summary text */}
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          {politician.summary}
        </p>

        {/* Follow-up Accordion if present */}
        {hasFollowUps && (
          <div className="mb-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowUpsOpen(!isFollowUpsOpen);
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/90 text-[#8370AF] text-xs font-bold border border-purple-100 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <span>{isFollowUpsOpen ? "▼" : "＋"}</span>
                <span className="truncate">
                  {isFollowUpsOpen
                    ? "続報を閉じる"
                    : `続報を見る（最新：${latestFollowUp?.date || ""}）`}
                </span>
              </span>
              <span className="text-[10px] text-purple-600/70 shrink-0 font-medium ml-1">
                {isFollowUpsOpen ? "閉じる" : `全${politician.followUps!.length}件`}
              </span>
            </button>

            {isFollowUpsOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2 p-3 rounded-xl bg-gradient-to-br from-purple-50/50 via-slate-50/50 to-pink-50/30 border border-purple-100/80 space-y-2.5 text-xs text-slate-700 animate-in fade-in duration-150"
              >
                {politician.followUps!.map((fu, idx) => (
                  <div
                    key={idx}
                    className="pb-2.5 border-b border-purple-100/60 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-bold text-[#8370AF] text-[11px] flex items-center gap-1">
                        <span>★ 続報</span>
                        {fu.committee && <span>・{fu.committee}</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{fu.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px] mb-1.5 whitespace-pre-line">
                      {fu.summary}
                    </p>
                    {fu.sourceUrl && (
                      <div className="text-right">
                        <a
                          href={fu.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-purple-600 hover:text-purple-800 hover:underline inline-flex items-center gap-0.5 text-[10px] font-medium"
                        >
                          <span>出典：{fu.sourceLabel || "議事録"}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Area: Source & Correction Link */}
      <div className="pt-2 border-t border-slate-100/80 text-[11px] text-slate-500 flex items-center justify-between gap-2 mt-auto">
        <div className="truncate">
          {politician.sourceUrl ? (
            <a
              href={politician.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-purple-600 hover:text-purple-800 hover:underline inline-flex items-center gap-1 font-medium truncate"
            >
              <span>出典：{politician.sourceTitle ?? "議事録を開く"}</span>
              <span className="shrink-0">↗</span>
            </a>
          ) : (
            <span className="text-[10px] text-slate-400">
              {politician.questionDate ? `${politician.questionDate} 発言` : ""}
            </span>
          )}
        </div>

        <Link
          href={`/request?target=${encodeURIComponent(`${politician.name}（紹介カード ${politician.id}）`)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline shrink-0 transition-colors ml-auto"
        >
          情報の訂正・削除依頼
        </Link>
      </div>
    </article>
  );
}
