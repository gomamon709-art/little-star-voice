"use client";

import React, { useMemo } from "react";
import { Politician } from "@/data/politicians";

// 47都道府県のグリッド座標（11列 × 10行）
// 日本列島の地理的形状を直感的に再現したブロック配置
export interface PrefectureCoordinate {
  name: string; // 正式名称（例: 東京都、北海道）
  shortName: string; // 2文字短縮表記（タイル表示用）
  col: number; // 0..10
  row: number; // 1..9
}

const PREFECTURES_GRID: PrefectureCoordinate[] = [
  // ── 北海道・東北 ──
  { name: "北海道", shortName: "北海", col: 10, row: 1 },
  { name: "青森県", shortName: "青森", col: 9, row: 2 },
  { name: "秋田県", shortName: "秋田", col: 8, row: 3 },
  { name: "岩手県", shortName: "岩手", col: 9, row: 3 },
  { name: "山形県", shortName: "山形", col: 8, row: 4 },
  { name: "宮城県", shortName: "宮城", col: 9, row: 4 },
  { name: "福島県", shortName: "福島", col: 9, row: 5 },

  // ── 関東 ──
  { name: "群馬県", shortName: "群馬", col: 7, row: 5 },
  { name: "栃木県", shortName: "栃木", col: 8, row: 5 },
  { name: "茨城県", shortName: "茨城", col: 9, row: 6 },
  { name: "埼玉県", shortName: "埼玉", col: 8, row: 6 },
  { name: "千葉県", shortName: "千葉", col: 9, row: 7 },
  { name: "東京都", shortName: "東京", col: 8, row: 7 },
  { name: "神奈川県", shortName: "神奈", col: 8, row: 8 },

  // ── 中部 ──
  { name: "新潟県", shortName: "新潟", col: 7, row: 4 },
  { name: "富山県", shortName: "富山", col: 6, row: 4 },
  { name: "石川県", shortName: "石川", col: 5, row: 4 },
  { name: "福井県", shortName: "福井", col: 5, row: 5 },
  { name: "長野県", shortName: "長野", col: 7, row: 6 },
  { name: "岐阜県", shortName: "岐阜", col: 6, row: 5 },
  { name: "山梨県", shortName: "山梨", col: 7, row: 7 },
  { name: "愛知県", shortName: "愛知", col: 6, row: 6 },
  { name: "静岡県", shortName: "静岡", col: 7, row: 8 },

  // ── 近畿 ──
  { name: "滋賀県", shortName: "滋賀", col: 5, row: 6 },
  { name: "京都府", shortName: "京都", col: 4, row: 5 },
  { name: "大阪府", shortName: "大阪", col: 4, row: 6 },
  { name: "兵庫県", shortName: "兵庫", col: 3, row: 5 },
  { name: "奈良県", shortName: "奈良", col: 4, row: 7 },
  { name: "三重県", shortName: "三重", col: 5, row: 7 },
  { name: "和歌山県", shortName: "和歌", col: 4, row: 8 },

  // ── 中国 ──
  { name: "鳥取県", shortName: "鳥取", col: 3, row: 4 },
  { name: "島根県", shortName: "島根", col: 2, row: 4 },
  { name: "岡山県", shortName: "岡山", col: 3, row: 6 },
  { name: "広島県", shortName: "広島", col: 2, row: 5 },
  { name: "山口県", shortName: "山口", col: 1, row: 5 },

  // ── 四国 ──
  { name: "香川県", shortName: "香川", col: 3, row: 7 },
  { name: "徳島県", shortName: "徳島", col: 3, row: 8 },
  { name: "愛媛県", shortName: "愛媛", col: 2, row: 7 },
  { name: "高知県", shortName: "高知", col: 2, row: 8 },

  // ── 九州・沖縄 ──
  { name: "福岡県", shortName: "福岡", col: 1, row: 6 },
  { name: "佐賀県", shortName: "佐賀", col: 0, row: 6 },
  { name: "長崎県", shortName: "長崎", col: 0, row: 7 },
  { name: "熊本県", shortName: "熊本", col: 1, row: 7 },
  { name: "大分県", shortName: "大分", col: 2, row: 6 },
  { name: "宮崎県", shortName: "宮崎", col: 1, row: 8 },
  { name: "鹿児島県", shortName: "鹿児", col: 0, row: 8 },
  { name: "沖縄県", shortName: "沖縄", col: 0, row: 9 },
];

interface JapanStarMapProps {
  politicians: Politician[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export function JapanStarMap({
  politicians,
  selectedRegion,
  onSelectRegion,
}: JapanStarMapProps) {
  // 都道府県ごとの議員数を自動集計
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of politicians) {
      // 都道府県名（または地域名）
      const pref = p.prefecture || p.region || "";
      if (pref) {
        map[pref] = (map[pref] || 0) + 1;
      }
    }
    return map;
  }, [politicians]);

  // 国会議員の人数
  const dietCount = counts["国会"] || 0;

  // 47都道府県のうち、星が灯った（1人以上議員がいる）都道府県数
  const litCount = useMemo(() => {
    return PREFECTURES_GRID.filter((p) => (counts[p.name] || 0) > 0).length;
  }, [counts]);

  // 進捗パーセンテージ（最大100%）
  const progressPercent = Math.round((litCount / 47) * 100);

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-4 mb-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-purple-100/90 shadow-2xs">
        {/* ── マップ上部ヘッダー ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FEF08A] to-[#E9D5FF] text-amber-700 text-xs shadow-2xs font-bold">
                ✨
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                日本星灯りマップ
              </h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                全国47都道府県
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              議会で声を届けてくれた議員さんのいる地域に、星の灯りがともっています。
            </p>
          </div>

          {/* 国会別枠バッジ */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onSelectRegion("国会")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                selectedRegion === "国会"
                  ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400 ring-offset-1"
                  : "bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
              }`}
              title="国会所属の議員で絞り込み"
            >
              <span className="text-sm">🏛️</span>
              <span>国会</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedRegion === "国会"
                    ? "bg-white/20 text-white"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {dietCount}人
              </span>
            </button>
          </div>
        </div>

        {/* ── 進捗バー（パステルラベンダー & イエロー） ── */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-purple-50/60 to-pink-50/40 border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-700">
              <span className="text-amber-500">✨</span>
              <span>
                47都道府県中{" "}
                <strong className="text-base sm:text-lg text-purple-700 font-extrabold">
                  {litCount}
                </strong>{" "}
                県に星が灯りました
              </span>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/60 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FDE047] via-[#FBBF24] to-[#C084FC] transition-all duration-700 shadow-xs"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            />
          </div>
        </div>

        {/* ── 47都道府県 ブロックマップ（日本列島グリッド） ── */}
        <div className="w-full overflow-x-auto pb-2 flex justify-center">
          <div
            className="grid grid-cols-11 gap-1 sm:gap-1.5 max-w-xl w-full select-none"
            style={{ minWidth: "320px" }}
          >
            {PREFECTURES_GRID.map((pref) => {
              const count = counts[pref.name] || 0;
              const isSelected = selectedRegion === pref.name;

              // 色とスタイルの決定
              // 0人: 薄いウォームグレー・白系（未点灯）
              // 1人: 優しいパステルイエロー（#FEF08A / #FEF9C3 系）
              // 2人以上: 穏やかなパステルラベンダー（#E9D5FF / #DDD6FE 系）
              let bgStyle = "bg-slate-50/90 text-slate-400 border-slate-200/70 hover:bg-slate-100/90";
              let badgeEl = null;

              if (count === 1) {
                bgStyle =
                  "bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] text-amber-900 border-amber-300 shadow-2xs font-bold hover:brightness-95";
                badgeEl = (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 text-[9px] shadow-xs">
                    ★
                  </span>
                );
              } else if (count >= 2) {
                bgStyle =
                  "bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] text-purple-950 border-purple-300 shadow-xs font-bold hover:brightness-95";
                badgeEl = (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 rounded-full bg-purple-500 text-white text-[9px] font-extrabold shadow-xs">
                    {count}
                  </span>
                );
              }

              return (
                <button
                  key={pref.name}
                  type="button"
                  onClick={() => onSelectRegion(pref.name)}
                  style={{
                    gridColumnStart: pref.col + 1,
                    gridRowStart: pref.row,
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-150 cursor-pointer aspect-square min-h-[30px] sm:min-h-[42px] p-0.5 ${bgStyle} ${
                    isSelected
                      ? "ring-2.5 ring-purple-600 ring-offset-2 scale-105 z-20 shadow-md !font-black"
                      : "hover:scale-102"
                  }`}
                  title={`${pref.name}（${count}人）`}
                >
                  <span className="text-[10px] sm:text-xs leading-none tracking-tighter">
                    {pref.shortName}
                  </span>
                  {badgeEl}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 凡例 & ガイド ── */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>💡</span>
            <span>タイルをタップするとその都道府県の議員さんに絞り込めます</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] border border-amber-300 shadow-2xs inline-block" />
              <span className="text-slate-600 font-medium">1人（星灯り）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] border border-purple-300 shadow-2xs inline-block" />
              <span className="text-slate-600 font-medium">2人以上（星めぐり）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 inline-block" />
              <span className="text-slate-400">0人（未点灯）</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
