"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Policy, PolicyTheme } from "@/lib/policies-data";
import { getPolicies } from "@/lib/supabase";

// セクション定義（表示順を固定）
const SECTIONS: {
  theme: PolicyTheme;
  subtitle: string;
}[] = [
  {
    theme: "付き添い・面会の費用を支える",
    subtitle: "病院へ通う・泊まる家族の負担を軽くする制度",
  },
  {
    theme: "母乳バンク・ドナーミルクや搾乳を支える",
    subtitle: "小さな赤ちゃんに母乳を届ける仕組みや費用を補助",
  },
  {
    theme: "早産児・低出生体重児支援",
    subtitle: "小さく生まれた赤ちゃんと家族に寄り添う支援",
  },
];

// テーマごとのアイコン描画
function SectionIcon({ theme }: { theme: PolicyTheme }) {
  switch (theme) {
    case "付き添い・面会の費用を支える":
      return (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#1b6b50"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "母乳バンク・ドナーミルクや搾乳を支える":
      return (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#1b6b50"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* 乳首 / キャップ */}
          <path d="M10 2a2 2 0 0 1 4 0v1h-4z" />
          <path d="M7.5 4.5h9" />
          {/* ボトル本体 */}
          <rect x="7" y="6.5" width="10" height="15" rx="2" />
          {/* 目盛り */}
          <path d="M7 10h3" />
          <path d="M7 13.5h4" />
          <path d="M7 17h3" />
        </svg>
      );
    case "早産児・低出生体重児支援":
      return (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#1b6b50"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12h.01" />
          <path d="M15 12h.01" />
          <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
          <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
        </svg>
      );
  }
}

interface AboutPageClientProps {
  initialPolicies: Policy[];
}

export function AboutPageClient({ initialPolicies }: AboutPageClientProps) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [filterOpen, setFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("すべて");
  const [selectedPref, setSelectedPref] = useState<string>("すべて");

  // クライアント側でも最新データを同期
  useEffect(() => {
    let isMounted = true;
    getPolicies().then((data) => {
      if (isMounted && data && data.length > 0) {
        setPolicies(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 都道府県一覧（重複排除）
  const prefList = useMemo(() => {
    const set = new Set(policies.map((p) => p.pref));
    return ["すべて", ...Array.from(set)];
  }, [policies]);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      if (selectedTheme !== "すべて" && p.theme !== selectedTheme) return false;
      if (selectedPref !== "すべて" && p.pref !== selectedPref) return false;
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        const hay = [p.name, p.body, p.pref, p.municipality, p.id].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [policies, selectedTheme, selectedPref, keyword]);

  const hasFilter = selectedTheme !== "すべて" || selectedPref !== "すべて" || keyword.trim() !== "";

  function reset() {
    setSelectedTheme("すべて");
    setSelectedPref("すべて");
    setKeyword("");
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(232, 249, 243, 0.80) 0%, rgba(238, 246, 255, 0.82) 100%), url('/header.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
        {/* ── ヘッダー ── */}
        <header className="text-center mb-8">
          <div className="inline-block mb-3">
            <span className="bg-white/80 backdrop-blur-sm border border-white/60 text-slate-500 text-[11px] font-medium px-4 py-1 rounded-full shadow-sm">
              little star voice
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 tracking-wide">
            <span className="text-yellow-400">★</span> 制度紹介{" "}
            <span className="text-orange-400">★</span>
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-6">
            little star voice が紹介してきた、自治体の支援制度をまとめました。<br />
            小さな命と家族を支える仕組みを、テーマごとに並べています。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://x.com/lsvsince2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium shadow hover:brightness-110 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.802l4.264 5.636 5.928-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X（@lsvsince2026）
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 text-sm font-medium shadow hover:bg-white transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              議員紹介マップはこちら
            </Link>
          </div>
        </header>

        {/* ── 絞り込みバー ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/70 mb-8 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 text-left cursor-pointer flex-1 mr-2"
            >
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M9 20h6" />
                </svg>
                絞り込み
              </span>
              <span className="text-slate-400">＋</span>
              <span className="text-slate-500">
                {hasFilter
                  ? `${filtered.length}件を表示中（全${policies.length}件）`
                  : `すべての制度を表示しています（${policies.length}件）`}
              </span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-600 hover:text-slate-800 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <span className="text-[13px] leading-none text-slate-500">↻</span>
                リセット
              </button>

              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={filterOpen ? "絞り込みを閉じる" : "絞り込みを開く"}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    width: 16,
                    height: 16,
                    transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {filterOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">テーマ</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option>すべて</option>
                  {SECTIONS.map((s) => (
                    <option key={s.theme}>{s.theme}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">都道府県</label>
                <select
                  value={selectedPref}
                  onChange={(e) => setSelectedPref(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {prefList.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">キーワード</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="制度名・自治体など…"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── セクション一覧 ── */}
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            const cards = filtered.filter((p) => p.theme === section.theme);
            if (cards.length === 0) return null;

            return (
              <section key={section.theme}>
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #b5edd8 0%, #bce3fa 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(130, 210, 190, 0.25)",
                    }}
                  >
                    <SectionIcon theme={section.theme} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">{section.theme}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-4 pl-0 sm:pl-14">
                  {cards.map((policy) => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                </div>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              条件に合う制度が見つかりませんでした。
              <button onClick={reset} className="block mx-auto mt-3 text-emerald-500 hover:underline text-xs">
                絞り込みをリセット
              </button>
            </div>
          )}
        </div>

        {/* ── フッター ── */}
        <footer className="mt-16">
          <div className="bg-white/75 backdrop-blur-sm rounded-2xl shadow-sm border border-white/70 px-6 py-7 text-center">
            <div className="flex justify-center gap-2 mb-3">
              <span className="text-sky-300 text-base">★</span>
              <span className="text-yellow-300 text-base">★</span>
              <span className="text-pink-300 text-base">★</span>
            </div>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              このページは少しずつアップデート中です。<br />
              制度も順次追加していきます。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 transition-all"
              >
                議員紹介マップはこちら
              </Link>
              <a
                href="https://x.com/lsvsince2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium shadow-sm hover:brightness-110 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13 }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.802l4.264 5.636 5.928-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X（@lsvsince2026）
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            little star voice（@lsvsince2026）
          </p>
        </footer>
      </div>
    </div>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  const location = policy.municipality
    ? `${policy.pref}　${policy.municipality}`
    : policy.pref;

  return (
    <article className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-white/70 px-5 py-5 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          <span className="text-emerald-400">✦</span>
          {policy.id}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 11, height: 11, color: "#94a3b8" }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {location}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">{policy.name}</h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-4">{policy.body}</p>

      <div>
        {policy.sourceUrl ? (
          <a
            href={policy.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full font-medium transition-colors"
          >
            出典：{policy.sourceLabel} ↗
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            出典：{policy.sourceLabel} ↗
          </span>
        )}
      </div>
    </article>
  );
}
