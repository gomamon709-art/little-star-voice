"use client";

import React from "react";

export function BackgroundDecorations() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ── ベース：極淡パステルグラデーション ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 70% at 10% 10%, rgba(255,210,230,0.70) 0%, transparent 60%),
            radial-gradient(ellipse 75% 65% at 90% 8%,  rgba(210,235,255,0.65) 0%, transparent 58%),
            radial-gradient(ellipse 80% 60% at 50% 55%, rgba(255,250,210,0.60) 0%, transparent 62%),
            radial-gradient(ellipse 70% 60% at 8%  90%, rgba(200,235,255,0.60) 0%, transparent 58%),
            radial-gradient(ellipse 72% 60% at 92% 92%, rgba(240,220,255,0.55) 0%, transparent 58%),
            linear-gradient(145deg, #fce8f2 0%, #e8f4ff 35%, #fff9e6 65%, #e2f4ff 100%)
          `,
        }}
      />

      {/* ── 中央のやわらかい白いもやで奥行きを出す ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(255,255,255,0.45) 0%, transparent 70%)`,
        }}
      />

      {/* ── 左右余白の極薄デコレーション（SVG） ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ===== 左サイド ===== */}

        {/* 左上：水色の小さな丸み星 */}
        <g transform="translate(72, 90)" opacity="0.55">
          <path d="M0,-20 C3,-9 9,-3 20,-1 C9,2 3,8 5,20 C0,12 -5,12 -5,20 C-3,8 -9,2 -20,-1 C-9,-3 -3,-9 0,-20 Z"
            fill="#c5e9ff" stroke="#a8d8f5" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* 左中上：薄ピンクのハート */}
        <g transform="translate(55, 290)" opacity="0.45">
          <path d="M0,16 C-10,7 -18,0 -18,-8 C-18,-16 -10,-20 0,-12 C10,-20 18,-16 18,-8 C18,0 10,7 0,16 Z"
            fill="#ffc8dc" stroke="#ffaac8" strokeWidth="1.4" strokeLinejoin="round" />
        </g>

        {/* 左中：薄黄色の小星 */}
        <g transform="translate(90, 460)" opacity="0.50">
          <path d="M0,-16 C2,-7 7,-2 16,-1 C7,1 2,6 4,16 C0,10 -4,10 -4,16 C-2,6 -7,1 -16,-1 C-7,-2 -2,-7 0,-16 Z"
            fill="#fff4a0" stroke="#ffe870" strokeWidth="1.4" strokeLinejoin="round" />
        </g>

        {/* 左下：水色の小さな星（やや大きめ） */}
        <g transform="translate(65, 660)" opacity="0.45">
          <path d="M0,-22 C3,-10 10,-4 22,-2 C10,2 4,9 6,22 C0,14 -6,14 -6,22 C-4,9 -10,2 -22,-2 C-10,-4 -3,-10 0,-22 Z"
            fill="#b8e4ff" stroke="#98cef5" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* ===== 右サイド ===== */}

        {/* 右上：薄ピンクの小星 */}
        <g transform="translate(1368, 80)" opacity="0.50">
          <path d="M0,-18 C2,-8 8,-2 18,-1 C8,2 2,8 4,18 C0,11 -4,11 -4,18 C-2,8 -8,2 -18,-1 C-8,-2 -2,-8 0,-18 Z"
            fill="#ffd0e5" stroke="#ffb0ce" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* 右上やや内側：ラベンダーのハート */}
        <g transform="translate(1390, 240)" opacity="0.42">
          <path d="M0,14 C-9,6 -16,0 -16,-7 C-16,-14 -9,-17 0,-10 C9,-17 16,-14 16,-7 C16,0 9,6 0,14 Z"
            fill="#e0ceff" stroke="#c8b0f0" strokeWidth="1.4" strokeLinejoin="round" />
        </g>

        {/* 右中：薄黄色の星 */}
        <g transform="translate(1375, 430)" opacity="0.52">
          <path d="M0,-20 C3,-9 9,-3 20,-1 C9,2 3,8 5,20 C0,12 -5,12 -5,20 C-3,8 -9,2 -20,-1 C-9,-3 -3,-9 0,-20 Z"
            fill="#fff8b0" stroke="#ffe860" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* 右下：水色の小星 */}
        <g transform="translate(1360, 650)" opacity="0.48">
          <path d="M0,-17 C2,-8 8,-2 17,-1 C8,1 2,7 4,17 C0,11 -4,11 -4,17 C-2,7 -8,1 -17,-1 C-8,-2 -2,-8 0,-17 Z"
            fill="#c0eaff" stroke="#98d4f8" strokeWidth="1.4" strokeLinejoin="round" />
        </g>

        {/* 右下端：薄ピンクのハート */}
        <g transform="translate(1385, 790)" opacity="0.40">
          <path d="M0,13 C-8,5 -15,-1 -15,-8 C-15,-14 -8,-17 0,-10 C8,-17 15,-14 15,-8 C15,-1 8,5 0,13 Z"
            fill="#ffc8dc" stroke="#ffaac5" strokeWidth="1.3" strokeLinejoin="round" />
        </g>

        {/* ===== 点のような小さなキラキラ（左右に均等に） ===== */}

        {/* 左 */}
        <circle cx="40"   cy="180" r="2.5" fill="rgba(200,230,255,0.55)" />
        <circle cx="105"  cy="370" r="2"   fill="rgba(255,210,230,0.50)" />
        <circle cx="38"   cy="540" r="2.5" fill="rgba(255,245,180,0.52)" />
        <circle cx="100"  cy="750" r="2"   fill="rgba(190,228,255,0.50)" />

        {/* 右 */}
        <circle cx="1400" cy="160" r="2.5" fill="rgba(255,205,228,0.52)" />
        <circle cx="1335" cy="340" r="2"   fill="rgba(215,200,255,0.50)" />
        <circle cx="1402" cy="520" r="2.5" fill="rgba(255,245,170,0.52)" />
        <circle cx="1330" cy="720" r="2"   fill="rgba(185,230,255,0.50)" />
      </svg>
    </div>
  );
}
