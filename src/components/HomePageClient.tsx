"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Politician } from "@/data/politicians";
import { Header } from "@/components/Header";
import { FilterAccordion, FilterState } from "@/components/FilterAccordion";
import { PoliticianCard } from "@/components/PoliticianCard";
import { PoliticianModal } from "@/components/PoliticianModal";
import { getPoliticians } from "@/lib/supabase";

interface HomePageClientProps {
  initialPoliticians: Politician[];
}

export function HomePageClient({ initialPoliticians }: HomePageClientProps) {
  const [politicians, setPoliticians] = useState<Politician[]>(initialPoliticians);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    region: "すべて",
    theme: "すべて",
    party: "すべて",
    year: "すべて",
    search: "",
    sort: "card_asc",
  });

  // クライアント側でも最新データを同期
  useEffect(() => {
    let isMounted = true;
    getPoliticians().then((data) => {
      if (isMounted && data && data.length > 0) {
        setPoliticians(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // フィルタ・ソートされた議員一覧
  const filteredPoliticians = useMemo(() => {
    return politicians
      .filter((p) => {
        // 地域
        if (filters.region !== "すべて" && p.region !== filters.region) {
          return false;
        }
        // テーマ
        if (
          filters.theme !== "すべて" &&
          !p.themes.includes(filters.theme as any)
        ) {
          return false;
        }
        // 政党
        if (filters.party !== "すべて" && p.partyCategory !== filters.party) {
          return false;
        }
        // 年
        if (filters.year !== "すべて") {
          if (filters.year === "2026年" && p.questionYear !== 2026) return false;
          if (filters.year === "2025年" && p.questionYear !== 2025) return false;
          if (filters.year === "2024年" && p.questionYear !== 2024) return false;
          if (filters.year === "2023年" && p.questionYear !== 2023) return false;
          if (filters.year === "2022年以前" && p.questionYear > 2022) return false;
        }
        // キーワード検索
        if (filters.search.trim() !== "") {
          const query = filters.search.trim().toLowerCase();
          const targetText = [
            p.name,
            p.kana || "",
            p.party,
            p.title,
            p.divisionText || "",
            p.region,
            p.summary,
            ...p.themes,
          ]
            .join(" ")
            .toLowerCase();

          if (!targetText.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "card_asc") {
          return parseInt(a.id, 10) - parseInt(b.id, 10);
        }
        if (filters.sort === "date_desc") {
          if (b.questionYear !== a.questionYear) {
            return b.questionYear - a.questionYear;
          }
          return b.questionDate.localeCompare(a.questionDate, "ja");
        }
        if (filters.sort === "date_asc") {
          if (a.questionYear !== b.questionYear) {
            return a.questionYear - b.questionYear;
          }
          return a.questionDate.localeCompare(b.questionDate, "ja");
        }
        if (filters.sort === "name_asc") {
          return (a.kana || a.name).localeCompare(b.kana || b.name, "ja");
        }
        return 0;
      });
  }, [politicians, filters]);

  return (
    <div className="min-h-screen relative text-slate-800 pb-20 selection:bg-pink-200 selection:text-purple-900 flex flex-col items-center">
      {/* トップページ専用背景（header.jpg + 白グラデーション） */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.42)), url('/header.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header Section */}
        <Header onOpenFilter={() => setIsFilterOpen(true)} />

        {/* Filter Accordion */}
        <FilterAccordion
          filters={filters}
          onChange={setFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
          totalCount={politicians.length}
          filteredCount={filteredPoliticians.length}
        />

        {/* Politician List Section */}
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-row items-baseline justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                議員さん一覧
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                少しずつアップデート中です。議員さんも順次追加していきます。
              </p>
            </div>

            <div className="text-xs text-slate-500 font-normal shrink-0">
              {filteredPoliticians.length}人を表示中（全{politicians.length}人）
            </div>
          </div>

          {filteredPoliticians.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-14">
              {filteredPoliticians.map((politician) => (
                <PoliticianCard
                  key={politician.id}
                  politician={politician}
                  onSelect={setSelectedPolitician}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 rounded-2xl p-8 text-center border border-purple-100 max-w-md mx-auto my-8 shadow-2xs">
              <p className="text-sm font-bold text-slate-700 mb-2">
                該当する議員さんが見つかりませんでした
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    region: "すべて",
                    theme: "すべて",
                    party: "すべて",
                    year: "すべて",
                    search: "",
                    sort: "card_asc",
                  })
                }
                className="px-4 py-1.5 rounded-full bg-[#8370AF] text-white text-xs font-semibold cursor-pointer"
              >
                条件をリセット
              </button>
            </div>
          )}

          {/* 3 Theme Explanations Section */}
          <section className="bg-white/90 backdrop-blur-xs rounded-2xl p-6 sm:p-7 border border-purple-100/90 shadow-2xs mb-10">
            <h3 className="text-sm font-bold text-[#8370AF] tracking-wide mb-4 flex items-center gap-1.5">
              <span>★</span>
              <span>3つのテーマについて</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100/80">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700 mb-2">
                  早産児支援
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  小さな命と、その家族への支援。修正月齢に合わせた制度の運用、搾乳できる環境づくり、リトルベビーハンドブックなど。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100/80">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 mb-2">
                  母乳バンク
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ドナーミルクを使えるようにする取り組み。母乳バンクの整備、ドナー登録の環境づくり、法的な位置づけの検討など。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/80">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 mb-2">
                  付き添い入院
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  入院中の子どもに付き添う家族への支援。食事や睡眠の環境、滞在施設、実態の把握と制度づくりなど。
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Detail Modal */}
      <PoliticianModal
        politician={selectedPolitician}
        onClose={() => setSelectedPolitician(null)}
      />
    </div>
  );
}
