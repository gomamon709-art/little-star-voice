"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Politician } from "@/data/politicians";
import { Header } from "@/components/Header";
import { FilterAccordion, FilterState } from "@/components/FilterAccordion";
import { PoliticianCard } from "@/components/PoliticianCard";
import { PoliticianModal } from "@/components/PoliticianModal";
import { JapanStarMap } from "@/components/JapanStarMap";
import { getPoliticians } from "@/lib/supabase";

interface HomePageClientProps {
  initialPoliticians: Politician[];
}

// 政党フィルター判定（partyCategoryとpartyの両方に対応）
function matchesPartyFilter(p: Politician, filterParty: string): boolean {
  if (filterParty === "すべて") return true;

  const cat = p.partyCategory || "";
  const party = p.party || "";

  // 完全一致
  if (cat === filterParty || party === filterParty) {
    return true;
  }

  // 「公明党」フィルター：partyCategoryが「公明党」または「公明」、あるいはparty名に「公明」が含まれる場合
  if (filterParty === "公明党") {
    return cat === "公明党" || cat === "公明" || party.includes("公明");
  }

  // 「自民党」フィルター：自民党/自民/自由民主党
  if (filterParty === "自民党") {
    return cat === "自民党" || cat === "自民" || party.includes("自民");
  }

  // 「立憲民主党」フィルター：立憲民主党/立憲
  if (filterParty === "立憲民主党") {
    return cat === "立憲民主党" || cat === "立憲" || party.includes("立憲");
  }

  // 「日本維新の会」フィルター：日本維新の会/維新
  if (filterParty === "日本維新の会") {
    return cat === "日本維新の会" || cat === "維新" || party.includes("維新");
  }

  // 「日本共産党」フィルター：日本共産党/共産
  if (filterParty === "日本共産党") {
    return cat === "日本共産党" || cat === "共産" || party.includes("共産");
  }

  // 「国民民主党」フィルター：国民民主党/国民
  if (filterParty === "国民民主党") {
    return cat === "国民民主党" || cat === "国民" || party.includes("国民");
  }

  // 「れいわ新選組」フィルター：れいわ新選組/れいわ
  if (filterParty === "れいわ新選組") {
    return cat === "れいわ新選組" || cat === "れいわ" || party.includes("れいわ");
  }

  // 「社会民主党」フィルター：社会民主党/社民
  if (filterParty === "社会民主党") {
    return cat === "社会民主党" || cat === "社民" || party.includes("社民");
  }

  // 「参政党」フィルター：参政党/参政
  if (filterParty === "参政党") {
    return cat === "参政党" || cat === "参政" || party.includes("参政");
  }

  // 「都民ファーストの会」フィルター
  if (filterParty === "都民ファーストの会") {
    return cat === "都民ファーストの会" || cat.includes("都民ファースト") || party.includes("都民ファースト");
  }

  // 「チームみらい」フィルター
  if (filterParty === "チームみらい") {
    return cat === "チームみらい" || party.includes("チームみらい");
  }

  // 「無所属」フィルター
  if (filterParty === "無所属") {
    return cat === "無所属" || party.includes("無所属");
  }

  return cat.includes(filterParty) || party.includes(filterParty);
}

export function HomePageClient({ initialPoliticians }: HomePageClientProps) {
  const [politicians, setPoliticians] = useState<Politician[]>(initialPoliticians);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [filters, setFilters] = useState<FilterState>({
    region: "すべて",
    theme: "すべて",
    party: "すべて",
    year: "すべて",
    search: "",
    sort: "card_desc",
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
        if (filters.region !== "すべて") {
          const matchRegion =
            p.region === filters.region || p.prefecture === filters.region;
          if (!matchRegion) {
            return false;
          }
        }
        // テーマ
        if (
          filters.theme !== "すべて" &&
          !p.themes.includes(filters.theme as any)
        ) {
          return false;
        }
        // 政党
        if (!matchesPartyFilter(p, filters.party)) {
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
        return sortOrder === "desc"
          ? Number(b.id) - Number(a.id)
          : Number(a.id) - Number(b.id);
      });
  }, [politicians, filters, sortOrder]);

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

        {/* 日本星灯りマップ */}
        <JapanStarMap
          politicians={politicians}
          selectedRegion={filters.region}
          onSelectRegion={(region) => {
            const nextRegion = filters.region === region ? "すべて" : region;
            setFilters((prev) => ({
              ...prev,
              region: nextRegion,
            }));
            if (nextRegion !== "すべて") {
              const el = document.getElementById("politician-list");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          }}
        />

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
        <main id="politician-list" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                議員さん一覧
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                少しずつアップデート中です。議員さんも順次追加していきます。
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              <span className="text-xs text-slate-500 font-normal">
                {filteredPoliticians.length}人を表示中（全{politicians.length}人）
              </span>

              {/* 並び順切り替えボタン */}
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-emerald-200/90 hover:border-emerald-300 text-xs font-semibold text-[#18533f] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={sortOrder === "desc" ? "クリックで番号順（01〜）に切り替え" : "クリックで新しい順に切り替え"}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#288365]" />
                <span>{sortOrder === "desc" ? "新しい順" : "番号順（01〜）"}</span>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-[#288365]"
                >
                  {sortOrder === "desc" ? (
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  ) : (
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  )}
                </svg>
              </button>
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
                onClick={() => {
                  setFilters({
                    region: "すべて",
                    theme: "すべて",
                    party: "すべて",
                    year: "すべて",
                    search: "",
                    sort: "card_desc",
                  });
                  setSortOrder("desc");
                }}
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

          {/* Footer Section */}
          <footer className="mt-6 mb-12 text-center">
            <Link
              href="/request"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-xs font-medium text-slate-600 hover:text-purple-700 border border-purple-200/80 shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <span>✉️</span>
              <span>情報の訂正・削除依頼 / 新しい発言の情報提供</span>
            </Link>
            <p className="text-[11px] text-slate-400 mt-4">
              © {new Date().getFullYear()} Little Star Voice. All rights reserved.
            </p>
          </footer>
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
