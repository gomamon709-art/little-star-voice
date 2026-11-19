"use client";

import React from "react";
import { REGIONS, THEMES, PARTIES, YEARS, SORT_OPTIONS } from "@/data/politicians";

export interface FilterState {
  region: string;
  theme: string;
  party: string;
  year: string;
  search: string;
  sort: string;
}

interface FilterAccordionProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterAccordion({
  filters,
  onChange,
  isOpen,
  onToggle,
  totalCount,
  filteredCount,
}: FilterAccordionProps) {
  const isFiltered =
    filters.region !== "すべて" ||
    filters.theme !== "すべて" ||
    filters.party !== "すべて" ||
    filters.year !== "すべて" ||
    filters.search.trim() !== "" ||
    filters.sort !== "card_desc";

  const handleReset = () => {
    onChange({
      region: "すべて",
      theme: "すべて",
      party: "すべて",
      year: "すべて",
      search: "",
      sort: "card_desc",
    });
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mb-6">
      {/* Accordion Toggle Bar matching screenshot */}
      <div
        className={`w-full rounded-2xl border transition-all duration-200 shadow-2xs ${
          isOpen
            ? "bg-white border-purple-200 shadow-xs"
            : "bg-white/95 hover:bg-white border-purple-100/80 hover:border-purple-200"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full py-2.5 px-5 sm:px-6 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#8370AF] text-sm sm:text-base tracking-tight">
              絞り込み
            </span>
            <span className="text-xs text-slate-400 font-normal">
              地域・テーマ・政党・質問の年・並べ替え
            </span>

            {isFiltered && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-700">
                適用中 ({filteredCount}件)
              </span>
            )}
          </div>

          <div className="flex items-center shrink-0">
            {/* The + or - symbol matching screenshot */}
            <span className="text-xl font-light text-[#8370AF] leading-none select-none">
              {isOpen ? "−" : "＋"}
            </span>
          </div>
        </button>

        {/* Collapsible Filters */}
        {isOpen && (
          <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-slate-100">
            {/* Keyword Search */}
            <div className="mb-3.5">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                キーワード検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onChange({ ...filters, search: e.target.value })
                  }
                  placeholder="例：古川、早産児、リトルベビー、NICU..."
                  className="w-full px-3.5 py-1.5 pl-8 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300 focus:bg-white transition-all"
                />
                <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">
                  🔍
                </span>
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, search: "" })}
                    className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Selects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3.5">
              {/* Region */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  地域
                </label>
                <select
                  value={filters.region}
                  onChange={(e) =>
                    onChange({ ...filters, region: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  テーマ
                </label>
                <select
                  value={filters.theme}
                  onChange={(e) =>
                    onChange({ ...filters, theme: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Party */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  所属政党
                </label>
                <select
                  value={filters.party}
                  onChange={(e) =>
                    onChange({ ...filters, party: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  質問の年
                </label>
                <select
                  value={filters.year}
                  onChange={(e) =>
                    onChange({ ...filters, year: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort & Reset */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">
                  並べ替え:
                </span>
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    onChange({ ...filters, sort: e.target.value })
                  }
                  className="px-2 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  表示中: <strong className="text-[#8370AF] font-bold">{filteredCount}</strong> 人（全 {totalCount} 人）
                </span>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1 rounded-full text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
