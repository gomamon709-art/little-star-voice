"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Politician, FollowUpItem } from "@/data/politicians";
import { Policy, PolicyTheme } from "@/lib/policies-data";

export interface CorrectionRequestItem {
  id: string;
  request_type: string;
  target_politician: string;
  sender_role: string;
  content: string;
  source_url?: string | null;
  contact_url?: string | null;
  status: "pending" | "resolved";
  created_at: string;
}

type Tab = "politicians" | "policies";

const THEME_OPTIONS: ("早産児支援" | "母乳バンク" | "付き添い入院")[] = [
  "早産児支援",
  "母乳バンク",
  "付き添い入院",
];

const POLICY_THEME_OPTIONS: PolicyTheme[] = [
  "付き添い・面会の費用を支える",
  "母乳バンク・ドナーミルクや搾乳を支える",
  "早産児・低出生体重児支援",
];

const PARTY_CATEGORY_OPTIONS = [
  "自民党",
  "公明党",
  "立憲民主党",
  "日本維新の会",
  "日本共産党",
  "国民民主党",
  "れいわ新選組",
  "社会民主党",
  "参政党",
  "都民ファーストの会",
  "チームみらい",
  "無所属",
  "その他",
];

const CHAMBER_OPTIONS: ("衆議院" | "参議院" | "地方議会")[] = [
  "衆議院",
  "参議院",
  "地方議会",
];

const PREFECTURES_LIST = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

// テキストからの正規表現・ルールベース一括解析関数
function parsePoliticianFromText(
  rawText: string,
  base: Partial<Politician>
): { result: Partial<Politician>; detected: string[] } {
  const result: Partial<Politician> = { ...base };
  const detected: string[] = [];

  const text = rawText.trim();
  if (!text) return { result, detected };

  // 1. JSON / オブジェクト形式の解析試行
  try {
    const jsonCandidate = text.replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"');
    const parsedObj = JSON.parse(jsonCandidate);
    if (parsedObj && typeof parsedObj === "object") {
      if (parsedObj.id) { result.id = String(parsedObj.id); detected.push("ID"); }
      if (parsedObj.cardNo) { result.cardNo = String(parsedObj.cardNo); detected.push("カード番号"); }
      if (parsedObj.name) { result.name = String(parsedObj.name); detected.push("氏名"); }
      if (parsedObj.kana) { result.kana = String(parsedObj.kana); detected.push("ふりがな"); }
      if (parsedObj.party) { result.party = String(parsedObj.party); detected.push("政党"); }
      if (parsedObj.partyCategory) { result.partyCategory = String(parsedObj.partyCategory); detected.push("政党カテゴリ"); }
      if (parsedObj.chamber) { result.chamber = parsedObj.chamber; detected.push("議会種別"); }
      if (parsedObj.title) { result.title = String(parsedObj.title); detected.push("肩書"); }
      if (parsedObj.divisionText) { result.divisionText = String(parsedObj.divisionText); detected.push("区分"); }
      if (parsedObj.prefecture) { result.prefecture = String(parsedObj.prefecture); detected.push("都道府県"); }
      if (parsedObj.region) { result.region = String(parsedObj.region); detected.push("地域"); }
      if (parsedObj.questionDate) { result.questionDate = String(parsedObj.questionDate); detected.push("質問日"); }
      if (parsedObj.questionYear) { result.questionYear = Number(parsedObj.questionYear); detected.push("質問年"); }
      if (Array.isArray(parsedObj.themes)) { result.themes = parsedObj.themes; detected.push("テーマ"); }
      if (parsedObj.summary) { result.summary = String(parsedObj.summary); detected.push("概要"); }
      if (parsedObj.sourceTitle) { result.sourceTitle = String(parsedObj.sourceTitle); detected.push("出典名"); }
      if (parsedObj.sourceUrl) { result.sourceUrl = String(parsedObj.sourceUrl); detected.push("出典URL"); }
      if (parsedObj.xPostUrl) { result.xPostUrl = String(parsedObj.xPostUrl); detected.push("XポストURL"); }
    }
  } catch {
    // 通常のテキストパースへ
  }

  // 2. カード番号 & ID
  const cardMatch =
    text.match(/(?:紹介カード|カード|No\.?|ID)\s*[:：=]?\s*(\d+)/i) ||
    text.match(/id\s*[:：=]\s*["']?(\d+)["']?/i);
  if (cardMatch) {
    const rawId = cardMatch[1];
    const padId = rawId.padStart(2, "0");
    result.id = padId;
    result.cardNo = `紹介カード ${padId}`;
    if (!detected.includes("ID")) detected.push("ID");
    if (!detected.includes("カード番号")) detected.push("カード番号");
  }

  // 3. 氏名 & ふりがな
  const nameLabelMatch = text.match(
    /(?:氏名|名前|議員名)\s*[:：]?\s*([^\n\(\(（]+)(?:[（\(]([^\)）]+)[）\)])?/
  );
  if (nameLabelMatch) {
    const n = nameLabelMatch[1].trim();
    if (n) {
      result.name = n;
      if (!detected.includes("氏名")) detected.push("氏名");
    }
    if (nameLabelMatch[2]) {
      const k = nameLabelMatch[2].trim();
      result.kana = k;
      if (!detected.includes("ふりがな")) detected.push("ふりがな");
    }
  } else {
    // 氏名ラベルなし「古川あおい（ふるかわ あおい）」などのパターン
    const parenMatch = text.match(/^([^\s:：]{2,10})\s*[（\(]([ぁ-ん\s]{3,20})[）\)]/m);
    if (parenMatch && !result.name) {
      result.name = parenMatch[1].trim();
      result.kana = parenMatch[2].trim();
      if (!detected.includes("氏名")) detected.push("氏名");
      if (!detected.includes("ふりがな")) detected.push("ふりがな");
    }
  }

  // 個別のふりがなラベル
  const kanaLabelMatch = text.match(
    /(?:ふりがな|フリガナ|かな|よみがな|ルビ|kana|ruby)\s*[:：]?\s*([^\n]+)/i
  );
  if (kanaLabelMatch && kanaLabelMatch[1].trim()) {
    result.kana = kanaLabelMatch[1].trim();
    if (!detected.includes("ふりがな")) detected.push("ふりがな");
  }

  // 4. 政党
  const partyLabelMatch = text.match(/(?:政党|所属政党|会派|所属|party)\s*[:：]?\s*([^\n]+)/i);
  if (partyLabelMatch && partyLabelMatch[1].trim()) {
    result.party = partyLabelMatch[1].trim();
    if (!detected.includes("政党")) detected.push("政党");
  } else {
    const knownParties = [
      "自由民主党", "自民党", "立憲民主党", "公明党", "日本維新の会", "日本共産党",
      "国民民主党", "れいわ新選組", "社会民主党", "社民党", "参政党", "チームみらい",
      "ふくおか政策の会"
    ];
    for (const kp of knownParties) {
      if (text.includes(kp) && !result.party) {
        result.party = kp;
        if (!detected.includes("政党")) detected.push("政党");
        break;
      }
    }
  }

  // 政党カテゴリ自動判定
  if (result.party) {
    const p = result.party;
    if (p.includes("自民")) result.partyCategory = "自民党";
    else if (p.includes("公明")) result.partyCategory = "公明党";
    else if (p.includes("立憲")) result.partyCategory = "立憲民主党";
    else if (p.includes("維新")) result.partyCategory = "日本維新の会";
    else if (p.includes("共産")) result.partyCategory = "日本共産党";
    else if (p.includes("国民")) result.partyCategory = "国民民主党";
    else if (p.includes("れいわ")) result.partyCategory = "れいわ新選組";
    else if (p.includes("社民")) result.partyCategory = "社会民主党";
    else if (p.includes("参政")) result.partyCategory = "参政党";
    else if (p.includes("都民ファースト")) result.partyCategory = "都民ファーストの会";
    else if (p.includes("チームみらい")) result.partyCategory = "チームみらい";
    else if (p.includes("無所属")) result.partyCategory = "無所属";
    else result.partyCategory = "その他";
    if (!detected.includes("政党カテゴリ")) detected.push("政党カテゴリ");
  }

  // 5. 議会種別 (chamber)
  const chamberMatch = text.match(/(?:議会種別|議会|chamber)\s*[:：]?\s*(衆議院|参議院|地方議会)/i);
  if (chamberMatch) {
    result.chamber = chamberMatch[1] as any;
    if (!detected.includes("議会種別")) detected.push("議会種別");
  } else {
    if (text.includes("衆議院") || text.includes("衆院")) {
      result.chamber = "衆議院";
      if (!detected.includes("議会種別")) detected.push("議会種別");
    } else if (text.includes("参議院") || text.includes("参院")) {
      result.chamber = "参議院";
      if (!detected.includes("議会種別")) detected.push("議会種別");
    } else if (/(?:市議|県議|道議|府議|町議|村議|区議|市会|県会|都議|地方議会)/.test(text)) {
      result.chamber = "地方議会";
      if (!detected.includes("議会種別")) detected.push("議会種別");
    }
  }

  // 6. 肩書・選挙区
  const titleMatch = text.match(/(?:肩書・選挙区|肩書|役職|選挙区|title)\s*[:：]?\s*([^\n]+)/i);
  if (titleMatch && titleMatch[1].trim()) {
    result.title = titleMatch[1].trim();
    if (!detected.includes("肩書")) detected.push("肩書");
  } else {
    // 例: チームみらい・衆議院議員（比例九州沖縄）
    const autoTitleMatch = text.match(
      /([^\n]+・(?:衆議院議員|参議院議員|県議会議員|市議会議員|区議会議員|都議会議員)[^\n]*)/
    );
    if (autoTitleMatch && !result.title) {
      result.title = autoTitleMatch[1].trim();
      if (!detected.includes("肩書")) detected.push("肩書");
    }
  }

  // 7. 区分テキスト（divisionText: 例 国会｜国会（衆議院） または 福岡県・北九州市｜北九州市議会）
  const divMatch =
    text.match(/(?:区分テキスト|区分|divisionText)\s*[:：]?\s*([^\n]+)/i) ||
    text.match(/([^\n]+｜[^\n]+)/);
  if (divMatch && divMatch[1].trim()) {
    result.divisionText = divMatch[1].trim();
    if (!detected.includes("区分")) detected.push("区分");
  } else if (result.chamber === "衆議院") {
    result.divisionText = "国会｜国会（衆議院）";
  } else if (result.chamber === "参議院") {
    result.divisionText = "国会｜国会（参議院）";
  }

  // 8. 都道府県 (prefecture)
  const prefMatch = text.match(/(?:都道府県|地域|自治体|prefecture)\s*[:：]?\s*([^\n]+)/i);
  if (prefMatch && prefMatch[1].trim()) {
    const prefVal = prefMatch[1].trim();
    result.prefecture = prefVal;
    result.region = prefVal;
    if (!detected.includes("都道府県")) detected.push("都道府県");
  } else {
    let foundPref = "";
    for (const p of PREFECTURES_LIST) {
      if (text.includes(p)) {
        foundPref = p;
        break;
      }
    }
    if (foundPref) {
      result.prefecture = foundPref;
      result.region = foundPref;
      if (!detected.includes("都道府県")) detected.push("都道府県");
    } else if (result.chamber === "衆議院" || result.chamber === "参議院") {
      result.prefecture = "国会";
      result.region = "国会";
      if (!detected.includes("都道府県")) detected.push("都道府県");
    }
  }

  // 9. 質問日 & 質問年
  const dateMatch =
    text.match(/(?:質問日|質疑日|日付|date)\s*[:：]?\s*([^\n]+)/i) ||
    text.match(/(\d{4}年\s*\d{1,2}月\s*\d{1,2}日|\d{4}年)/);
  if (dateMatch && dateMatch[1].trim()) {
    result.questionDate = dateMatch[1].trim();
    if (!detected.includes("質問日")) detected.push("質問日");
    const yearMatch = result.questionDate.match(/(\d{4})/);
    if (yearMatch) {
      result.questionYear = parseInt(yearMatch[1]);
      if (!detected.includes("質問年")) detected.push("質問年");
    }
  } else {
    const anyYearMatch = text.match(/(?:20\d\d|19\d\d)年?/);
    if (anyYearMatch) {
      const y = parseInt(anyYearMatch[0]);
      result.questionYear = y;
      if (!result.questionDate) result.questionDate = `${y}年`;
      if (!detected.includes("質問年")) detected.push("質問年");
    }
  }

  // 10. テーマ（themes）
  const themesFound: ("早産児支援" | "母乳バンク" | "付き添い入院")[] = [];
  const themeMatch = text.match(/(?:テーマ|分野|タグ)\s*[:：]?\s*([^\n]+)/i);
  const themeSearchTarget = (themeMatch ? themeMatch[1] : "") + " " + text;

  if (/(?:早産児支援|早産児|低出生体重児|リトルベビー|就学猶予|修正月齢)/.test(themeSearchTarget)) {
    themesFound.push("早産児支援");
  }
  if (/(?:母乳バンク|ドナーミルク|搾乳)/.test(themeSearchTarget)) {
    themesFound.push("母乳バンク");
  }
  if (/(?:付き添い入院|付き添い|付添|ファミリーハウス|宿泊費|簡易ベッド)/.test(themeSearchTarget)) {
    themesFound.push("付き添い入院");
  }
  if (themesFound.length > 0) {
    result.themes = themesFound;
    if (!detected.includes("テーマ")) detected.push("テーマ");
  }

  // 11. 出典名 & 出典URL
  const srcTitleMatch = text.match(/(?:出典名?|情報源|参照|ソース|出典タイトル)\s*[:：]?\s*([^\n]+)/i);
  if (srcTitleMatch && srcTitleMatch[1].trim()) {
    const val = srcTitleMatch[1].trim();
    if (!val.startsWith("http")) {
      result.sourceTitle = val;
      if (!detected.includes("出典名")) detected.push("出典名");
    }
  }

  // 12. URLs（X紹介ポスト vs 出典URL）
  const allUrls = text.match(/https?:\/\/[^\s"'<>）\)]+/g) || [];
  for (const u of allUrls) {
    if (u.includes("x.com/") || u.includes("twitter.com/")) {
      result.xPostUrl = u;
      if (!detected.includes("XポストURL")) detected.push("XポストURL");
    } else if (!result.sourceUrl) {
      result.sourceUrl = u;
      if (!detected.includes("出典URL")) detected.push("出典URL");
    }
  }

  // 13. 概要 / 紹介文
  const summaryMatch = text.match(
    /(?:概要|紹介文|本文|質疑概要|要約|内容|発言要旨)\s*[:：]?\s*([\s\S]*?)(?=(?:出典|URL|Xポスト|xPost|https?:\/\/|紹介カード|$))/i
  );
  if (summaryMatch && summaryMatch[1].trim()) {
    const s = summaryMatch[1].trim();
    if (s.length >= 8) {
      result.summary = s;
      if (!detected.includes("概要")) detected.push("概要");
    }
  }

  return { result, detected };
}

// 続報用テキスト・URL一括解析関数
function parseFollowUpFromText(
  rawText: string,
  explicitUrl?: string
): { item: FollowUpItem; detected: string[] } {
  const detected: string[] = [];
  const text = rawText.trim();

  let date = "";
  let committee = "";
  let summary = "";
  let sourceUrl = explicitUrl?.trim() || "";
  let sourceLabel = "";

  // 1. JSON形式の解析試行
  try {
    const jsonCandidate = text.replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"');
    const parsedObj = JSON.parse(jsonCandidate);
    if (parsedObj && typeof parsedObj === "object") {
      if (parsedObj.date) { date = String(parsedObj.date); detected.push("質問日"); }
      if (parsedObj.committee) { committee = String(parsedObj.committee); detected.push("会議名"); }
      if (parsedObj.summary) { summary = String(parsedObj.summary); detected.push("要約"); }
      if (parsedObj.sourceUrl || parsedObj.source_url) {
        sourceUrl = String(parsedObj.sourceUrl || parsedObj.source_url);
        detected.push("出典URL");
      }
      if (parsedObj.sourceLabel || parsedObj.source_label) {
        sourceLabel = String(parsedObj.sourceLabel || parsedObj.source_label);
        detected.push("出典名");
      }
    }
  } catch {
    // 通常のテキストパースへ
  }

  // 2. URLの抽出（explicitUrlがなければテキスト内から抽出）
  if (!sourceUrl) {
    const urlMatch = text.match(/https?:\/\/[^\s"'<>）\)]+/);
    if (urlMatch) {
      sourceUrl = urlMatch[0];
      detected.push("出典URL");
    }
  }

  // 3. 質問日・開催日 (date)
  if (!date) {
    const dateMatch =
      text.match(/(?:質問日|質疑日|開催日|発言日|日付|date)\s*[:：]?\s*([^\n]+)/i) ||
      text.match(/(\d{4}年\s*\d{1,2}月\s*\d{1,2}日|\d{4}年\s*\d{1,2}月|\d{4}\/\d{1,2}\/\d{1,2})/);
    if (dateMatch) {
      date = dateMatch[1].trim();
      detected.push("質問日");
    } else {
      date = new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // 4. 会議名・委員会名 (committee)
  if (!committee) {
    const commMatch =
      text.match(/(?:会議名?|委員会名?|委員会|議会名?|開催会議|会議|committee)\s*[:：]?\s*([^\n]+)/i) ||
      text.match(/([^\n]*(?:衆議院|参議院|委員会|本会議|予算委員会|厚生労働委員会|特別委員会|定例会|臨時会|常任委員会)[^\n]*)/);
    if (commMatch && commMatch[1].trim()) {
      committee = commMatch[1].trim();
      detected.push("会議名");
    }
  }

  // 5. 出典名 (sourceLabel)
  if (!sourceLabel) {
    const srcTitleMatch = text.match(
      /(?:出典名?|情報源|参照|ソース|出典タイトル|sourceLabel|source_label)\s*[:：]?\s*([^\n]+)/i
    );
    if (srcTitleMatch && srcTitleMatch[1].trim() && !srcTitleMatch[1].trim().startsWith("http")) {
      sourceLabel = srcTitleMatch[1].trim();
      detected.push("出典名");
    } else if (sourceUrl) {
      if (sourceUrl.includes("shugiin.go.jp")) sourceLabel = "衆議院 会議録";
      else if (sourceUrl.includes("sangiin.go.jp")) sourceLabel = "参議院 会議録";
      else if (sourceUrl.includes("note.com")) sourceLabel = "公式note";
      else if (sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be")) sourceLabel = "YouTube録画";
      else sourceLabel = "公式会議録・情報出典";
      if (!detected.includes("出典名")) detected.push("出典名");
    }
  }

  // 6. 要約・内容テキスト (summary)
  if (!summary) {
    const summaryMatch = text.match(
      /(?:概要|紹介文|本文|質疑概要|要約|内容|発言要旨|質問と答弁)\s*[:：]?\s*([\s\S]*?)(?=(?:出典|URL|https?:\/\/|$))/i
    );
    if (summaryMatch && summaryMatch[1].trim() && summaryMatch[1].trim().length >= 5) {
      summary = summaryMatch[1].trim();
      detected.push("要約");
    } else {
      let cleaned = text;
      if (sourceUrl) {
        cleaned = cleaned.replace(sourceUrl, "");
      }
      cleaned = cleaned
        .replace(/(?:質問日|質疑日|開催日|発言日|日付|date)\s*[:：]?\s*[^\n]+\n?/gi, "")
        .replace(/(?:会議名?|委員会名?|committee)\s*[:：]?\s*[^\n]+\n?/gi, "")
        .replace(/(?:出典名?|情報源|参照|ソース|出典タイトル)\s*[:：]?\s*[^\n]+\n?/gi, "")
        .trim();

      if (cleaned.length > 0) {
        summary = cleaned;
        detected.push("要約");
      } else {
        summary = text;
        detected.push("要約");
      }
    }
  }

  return {
    item: {
      date,
      committee,
      summary,
      sourceUrl: sourceUrl || undefined,
      sourceLabel: sourceLabel || undefined,
    },
    detected,
  };
}

export default function AdminPage() {
  // ── 認証ステート ──
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── タブ＆データステート ──
  const [currentTab, setCurrentTab] = useState<Tab>("politicians");
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [isRequestsSectionOpen, setIsRequestsSectionOpen] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── 検索・絞り込み ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThemeFilter, setSelectedThemeFilter] = useState("all");

  // ── 議員モーダル（追加／編集） ──
  const [isPoliticianModalOpen, setIsPoliticianModalOpen] = useState(false);
  const [isNewPoliticianMode, setIsNewPoliticianMode] = useState(false);
  const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);
  const [editingPolitician, setEditingPolitician] = useState<Partial<Politician> | null>(null);
  const [isSubmittingPolitician, setIsSubmittingPolitician] = useState(false);
  const [rawTextToParse, setRawTextToParse] = useState("");
  const [parseFeedback, setParseFeedback] = useState<string | null>(null);
  const [rawFollowUpText, setRawFollowUpText] = useState("");
  const [rawFollowUpUrl, setRawFollowUpUrl] = useState("");
  const [followUpParseFeedback, setFollowUpParseFeedback] = useState<string | null>(null);

  // ── 制度モーダル（追加／編集） ──
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy> | null>(null);
  const [isSubmittingPolicy, setIsSubmittingPolicy] = useState(false);

  // ── 削除確認ダイアログ ──
  const [deletingItem, setDeletingItem] = useState<{ type: "politician" | "policy" | "request"; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 認証チェック
  useEffect(() => {
    checkAuth();
  }, []);

  // ── 新規登録モーダル時の下書き自動保存 ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPoliticianModalOpen && isNewPoliticianMode && editingPolitician) {
      try {
        const hasInput =
          rawTextToParse.trim() !== "" ||
          Boolean(editingPolitician.name?.trim()) ||
          Boolean(editingPolitician.kana?.trim()) ||
          Boolean(editingPolitician.party?.trim()) ||
          Boolean(editingPolitician.summary?.trim()) ||
          Boolean(editingPolitician.title?.trim()) ||
          Boolean(editingPolitician.sourceUrl?.trim()) ||
          Boolean(editingPolitician.xPostUrl?.trim());

        if (hasInput) {
          const payload = {
            politician: editingPolitician,
            rawText: rawTextToParse,
            updatedAt: Date.now(),
          };
          localStorage.setItem("lsv_admin_politician_draft", JSON.stringify(payload));
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [isPoliticianModalOpen, isNewPoliticianMode, editingPolitician, rawTextToParse]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
      if (data.authenticated) {
        fetchAllData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  // ログイン実行
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "パスワードが正しくありません。");
      } else {
        setIsAuthenticated(true);
        setPasswordInput("");
        fetchAllData();
      }
    } catch {
      setLoginError("ログイン通信エラーが発生しました。");
    } finally {
      setIsLoggingIn(false);
    }
  }

  // ログアウト実行
  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setIsAuthenticated(false);
    } catch {
      // ignore
    }
  }

  // データ全件再取得
  async function fetchAllData() {
    setIsLoadingData(true);
    setMessage(null);
    try {
      const [resPol, resPlc, resReq] = await Promise.all([
        fetch("/api/admin/politicians"),
        fetch("/api/admin/policies"),
        fetch("/api/admin/requests"),
      ]);

      if (resPol.ok) {
        const dataPol = await resPol.json();
        setPoliticians(dataPol.politicians || []);
      }
      if (resPlc.ok) {
        const dataPlc = await resPlc.json();
        setPolicies(dataPlc.policies || []);
      }
      if (resReq.ok) {
        const dataReq = await resReq.json();
        setCorrectionRequests(dataReq.requests || []);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "データ取得に失敗しました: " + (err?.message || "通信エラー") });
    } finally {
      setIsLoadingData(false);
    }
  }

  // ── 訂正・削除依頼ステータス切り替えハンドラ ──
  async function handleToggleRequestStatus(item: CorrectionRequestItem) {
    const nextStatus = item.status === "resolved" ? "pending" : "resolved";
    setUpdatingRequestId(item.id);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ステータス更新に失敗しました。");
      }
      setCorrectionRequests((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: nextStatus } : r))
      );
      setMessage({
        type: "success",
        text: `依頼（${item.target_politician}）を「${nextStatus === "resolved" ? "対応済み" : "未対応"}」に変更しました。`,
      });
    } catch (err: any) {
      alert("エラー: " + err.message);
    } finally {
      setUpdatingRequestId(null);
    }
  }

  // ── 議員データ編集・登録ハンドラ ──
  function openNewPoliticianModal() {
    setIsNewPoliticianMode(true);
    setParseFeedback(null);

    // localStorageからの下書き復元チェック
    let restored = false;
    if (typeof window !== "undefined") {
      try {
        const rawSaved = localStorage.getItem("lsv_admin_politician_draft");
        if (rawSaved) {
          const saved = JSON.parse(rawSaved);
          if (saved && saved.politician) {
            setEditingPolitician(saved.politician);
            setRawTextToParse(saved.rawText || "");
            setDraftRestoredNotice(true);
            restored = true;
          }
        }
      } catch {
        // ignore
      }
    }

    if (!restored) {
      const nextNum = (politicians.length + 1).toString().padStart(2, "0");
      setRawTextToParse("");
      setDraftRestoredNotice(false);
      setEditingPolitician({
        id: nextNum,
        cardNo: `紹介カード ${nextNum}`,
        name: "",
        kana: "",
        party: "",
        partyCategory: "自民党",
        chamber: "衆議院",
        title: "",
        divisionText: "国会｜国会（衆議院）",
        prefecture: "国会",
        region: "国会",
        questionDate: new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }),
        questionYear: new Date().getFullYear(),
        themes: ["早産児支援"],
        summary: "",
        sourceTitle: "",
        sourceUrl: "",
        xPostUrl: "",
        followUps: [],
      });
    }

    setRawFollowUpText("");
    setRawFollowUpUrl("");
    setFollowUpParseFeedback(null);
    setIsPoliticianModalOpen(true);
  }

  function openEditPoliticianModal(p: Politician) {
    setIsNewPoliticianMode(false);
    setDraftRestoredNotice(false);
    setRawTextToParse("");
    setParseFeedback(null);
    setRawFollowUpText("");
    setRawFollowUpUrl("");
    setFollowUpParseFeedback(null);
    setEditingPolitician({
      ...p,
      followUps: p.followUps ? p.followUps.map((f) => ({ ...f })) : [],
    });
    setIsPoliticianModalOpen(true);
  }

  function handleClearDraft() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("lsv_admin_politician_draft");
      } catch {
        // ignore
      }
    }
    const nextNum = (politicians.length + 1).toString().padStart(2, "0");
    setRawTextToParse("");
    setParseFeedback(null);
    setDraftRestoredNotice(false);
    setEditingPolitician({
      id: nextNum,
      cardNo: `紹介カード ${nextNum}`,
      name: "",
      kana: "",
      party: "",
      partyCategory: "自民党",
      chamber: "衆議院",
      title: "",
      divisionText: "国会｜国会（衆議院）",
      prefecture: "国会",
      region: "国会",
      questionDate: new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }),
      questionYear: new Date().getFullYear(),
      themes: ["早産児支援"],
      summary: "",
      sourceTitle: "",
      sourceUrl: "",
      xPostUrl: "",
      followUps: [],
    });
  }

  // ── 続報（複数回の議会発言）ハンドラ ──
  function handleAddFollowUp() {
    if (!editingPolitician) return;
    const current = editingPolitician.followUps || [];
    setEditingPolitician({
      ...editingPolitician,
      followUps: [
        ...current,
        {
          date: new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          committee: "",
          summary: "",
          sourceUrl: "",
          sourceLabel: "",
        },
      ],
    });
  }

  function handleUpdateFollowUp(index: number, field: keyof FollowUpItem, value: string) {
    if (!editingPolitician || !editingPolitician.followUps) return;
    const updated = [...editingPolitician.followUps];
    updated[index] = { ...updated[index], [field]: value };
    setEditingPolitician({ ...editingPolitician, followUps: updated });
  }

  function handleRemoveFollowUp(index: number) {
    if (!editingPolitician || !editingPolitician.followUps) return;
    const updated = editingPolitician.followUps.filter((_, i) => i !== index);
    setEditingPolitician({ ...editingPolitician, followUps: updated });
  }

  function handleAutoParseFollowUp() {
    if (!rawFollowUpText.trim() && !rawFollowUpUrl.trim()) {
      alert("続報の要約テキストまたは出典URLを入力してください。");
      return;
    }
    if (!editingPolitician) return;

    const { item, detected } = parseFollowUpFromText(rawFollowUpText, rawFollowUpUrl);
    const current = editingPolitician.followUps || [];
    setEditingPolitician({
      ...editingPolitician,
      followUps: [...current, item],
    });

    if (detected.length > 0) {
      setFollowUpParseFeedback(
        `【続報 #${current.length + 1}】${detected.join("・")}を自動抽出して追加しました！`
      );
    } else {
      setFollowUpParseFeedback(`【続報 #${current.length + 1}】を追加しました。`);
    }

    setRawFollowUpText("");
    setRawFollowUpUrl("");
  }

  function handleAutoParsePolitician() {
    if (!rawTextToParse.trim()) {
      alert("解析するテキストを貼り付けてください。");
      return;
    }
    const { result, detected } = parsePoliticianFromText(
      rawTextToParse,
      editingPolitician || {}
    );
    setEditingPolitician(result);
    if (detected.length > 0) {
      setParseFeedback(
        `【${result.name || "解析完了"}】${detected.length}項目（${detected.join("、")}）を自動反映しました！`
      );
    } else {
      setParseFeedback("テキストを解析しましたが、該当する項目が見つかりませんでした。");
    }
  }

  async function handleSavePolitician(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPolitician || !editingPolitician.id || !editingPolitician.name || !editingPolitician.party) {
      alert("ID、氏名、政党を入力してください。");
      return;
    }

    const isEdit = politicians.some((p) => p.id === editingPolitician.id);
    const method = isEdit ? "PUT" : "POST";

    setIsSubmittingPolitician(true);
    try {
      const res = await fetch("/api/admin/politicians", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPolitician),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "保存に失敗しました。");
      }
      setMessage({
        type: "success",
        text: `議員データ「${editingPolitician.name}」を${isEdit ? "更新" : "登録"}しました！`,
      });
      // 新規登録成功時は下書きを自動削除
      if (!isEdit && typeof window !== "undefined") {
        try {
          localStorage.removeItem("lsv_admin_politician_draft");
        } catch {
          // ignore
        }
      }
      setDraftRestoredNotice(false);
      setIsPoliticianModalOpen(false);
      setEditingPolitician(null);
      fetchAllData();
    } catch (err: any) {
      alert("エラー: " + err.message);
    } finally {
      setIsSubmittingPolitician(false);
    }
  }

  // ── 制度データ編集・登録ハンドラ ──
  function openNewPolicyModal() {
    const nextNum = (policies.length + 1).toString().padStart(2, "0");
    setEditingPolicy({
      id: `制度紹介 ${nextNum}`,
      pref: "全国",
      municipality: "",
      name: "",
      theme: "付き添い・面会の費用を支える",
      body: "",
      sourceLabel: "",
      sourceUrl: "",
    });
    setIsPolicyModalOpen(true);
  }

  function openEditPolicyModal(p: Policy) {
    setEditingPolicy({ ...p });
    setIsPolicyModalOpen(true);
  }

  async function handleSavePolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPolicy || !editingPolicy.id || !editingPolicy.pref || !editingPolicy.name || !editingPolicy.body) {
      alert("ID、都道府県、制度名、説明文を入力してください。");
      return;
    }

    const isEdit = policies.some((p) => p.id === editingPolicy.id);
    const method = isEdit ? "PUT" : "POST";

    setIsSubmittingPolicy(true);
    try {
      const res = await fetch("/api/admin/policies", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPolicy),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "保存に失敗しました。");
      }
      setMessage({
        type: "success",
        text: `制度データ「${editingPolicy.name}」を${isEdit ? "更新" : "登録"}しました！`,
      });
      setIsPolicyModalOpen(false);
      setEditingPolicy(null);
      fetchAllData();
    } catch (err: any) {
      alert("エラー: " + err.message);
    } finally {
      setIsSubmittingPolicy(false);
    }
  }

  // ── 削除ハンドラ ──
  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const endpoint =
        deletingItem.type === "politician"
          ? `/api/admin/politicians?id=${encodeURIComponent(deletingItem.id)}`
          : deletingItem.type === "policy"
            ? `/api/admin/policies?id=${encodeURIComponent(deletingItem.id)}`
            : `/api/admin/requests?id=${encodeURIComponent(deletingItem.id)}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "削除に失敗しました。");
      }
      setMessage({
        type: "success",
        text: `「${deletingItem.name}」を正常に削除しました。`,
      });
      setDeletingItem(null);
      fetchAllData();
    } catch (err: any) {
      alert("エラー: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  // 絞り込み後の議員データ
  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.kana && p.kana.toLowerCase().includes(q)) ||
        p.party.toLowerCase().includes(q) ||
        p.prefecture.toLowerCase().includes(q) ||
        p.cardNo.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);

      const matchTheme =
        selectedThemeFilter === "all" || p.themes.includes(selectedThemeFilter as any);

      return matchSearch && matchTheme;
    });
  }, [politicians, searchQuery, selectedThemeFilter]);

  // 絞り込み後の制度データ
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.pref.toLowerCase().includes(q) ||
        (p.municipality && p.municipality.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.sourceLabel.toLowerCase().includes(q);

      const matchTheme =
        selectedThemeFilter === "all" || p.theme === selectedThemeFilter;

      return matchSearch && matchTheme;
    });
  }, [policies, searchQuery, selectedThemeFilter]);

  // ── 認証確認中 ──
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f3f9f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2efe9] text-center max-w-sm w-full">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-[#288365] border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-medium text-slate-600">管理画面を読み込み中...</p>
        </div>
      </div>
    );
  }

  // ── 未認証：ログイン画面 ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ebf8f2] via-[#f2f7fc] to-[#fcf4fa] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-emerald-100 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#a6e6cf] to-[#bce3fa] text-[#1b6b50] shadow-sm mb-3">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">little star voice ★</h1>
            <p className="text-xs text-slate-500 mt-1">データベース管理パネル ログイン</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#fecaca" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="#dc2626" strokeWidth="2" />
                <circle cx="12" cy="16" r="1" fill="#dc2626" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                管理用パスワード
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/30 focus:border-[#288365] transition"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#217559] to-[#2ca880] text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  確認中...
                </>
              ) : (
                "ログイン"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-[#217559] transition inline-flex items-center gap-1"
            >
              ← サイトトップへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 認証済み：管理ダッシュボード ──
  return (
    <div className="min-h-screen bg-[#f5faf7] text-slate-800 pb-20">
      {/* 上部ヘッダーバー */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9be3cb] to-[#bfe4fa] flex items-center justify-center text-[#1b6b50] shadow-xs">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">little star voice 管理パネル</h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase 接続中
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#217559] bg-slate-100 hover:bg-slate-200/70 rounded-lg transition hidden sm:inline-flex items-center gap-1.5"
            >
              <span>サイトを見る</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <Link
              href="/about"
              target="_blank"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#217559] bg-slate-100 hover:bg-slate-200/70 rounded-lg transition hidden sm:inline-flex items-center gap-1.5"
            >
              <span>制度紹介を見る</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition flex items-center gap-1"
            >
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* 通知バナー */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-sm flex items-start justify-between gap-3 shadow-xs ${message.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-rose-50/90 border-rose-200 text-rose-800"
              }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ── 📩 届いた訂正・削除依頼セクション ── */}
        <section className="mb-8 bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">
          {/* セクションヘッダー（開閉トグル可能） */}
          <div
            className="p-5 sm:p-6 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-white flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsRequestsSectionOpen((prev) => !prev)}
          >
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="text-xl">📩</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                届いた訂正・削除依頼
              </h2>
              {/* 未対応バッジ */}
              {correctionRequests.filter((r) => r.status === "pending").length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white animate-pulse shadow-2xs">
                  未対応 {correctionRequests.filter((r) => r.status === "pending").length}件
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  未対応 0件
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                （全 {correctionRequests.length}件）
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs font-medium hidden sm:inline">
                {isRequestsSectionOpen ? "折りたたむ" : "展開する"}
              </span>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${isRequestsSectionOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* 依頼リスト本体 */}
          {isRequestsSectionOpen && (
            <div className="p-5 sm:p-6 border-t border-purple-100/70 bg-purple-50/20">
              {correctionRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                  <p className="text-2xl mb-2">✨</p>
                  現在、届いている訂正・削除依頼はありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {correctionRequests.map((req) => {
                    const isPending = req.status === "pending";
                    const isUpdating = updatingRequestId === req.id;
                    const formattedDate = req.created_at
                      ? new Date(req.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "日時不明";

                    return (
                      <div
                        key={req.id}
                        className={`rounded-2xl p-5 border transition-all ${isPending
                            ? "bg-white border-rose-200/80 shadow-xs"
                            : "bg-slate-50/70 border-slate-200 text-slate-600 opacity-90"
                          }`}
                      >
                        {/* 上部ヘッダー（ステータス、種別、日時、アクションボタン） */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* ステータスバッジ */}
                            {isPending ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                未対応
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                                ✓ 対応済み
                              </span>
                            )}

                            {/* 依頼の種類 */}
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              {req.request_type}
                            </span>

                            {/* 依頼者のお立場 */}
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {req.sender_role}
                            </span>

                            {/* 送信日時 */}
                            <span className="text-[11px] text-slate-400 ml-1">
                              {formattedDate}
                            </span>
                          </div>

                          {/* ボタンエリア */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {/* ステータストグルボタン */}
                            <button
                              type="button"
                              onClick={() => handleToggleRequestStatus(req)}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${isPending
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                }`}
                            >
                              {isUpdating ? (
                                <span className="inline-block animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <span>{isPending ? "✓ 対応済みにする" : "↩ 未対応に戻す"}</span>
                              )}
                            </button>

                            {/* 削除ボタン */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingItem({
                                  type: "request",
                                  id: req.id,
                                  name: `${req.request_type} - ${req.target_politician}`,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                              title="この依頼を削除"
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>削除</span>
                            </button>
                          </div>
                        </div>

                        {/* 本文エリア */}
                        <div className="pt-3.5 space-y-2.5 text-xs sm:text-sm">
                          {/* 対象の議員名・カード番号 */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-slate-400 text-xs shrink-0 font-medium">対象：</span>
                            <span className="font-bold text-slate-800">
                              {req.target_politician}
                            </span>
                          </div>

                          {/* 具体的な内容 */}
                          <div>
                            <span className="text-slate-400 text-xs block mb-1 font-medium">依頼内容：</span>
                            <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                              {req.content}
                            </div>
                          </div>

                          {/* 参考URL & メールアドレス */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs">
                            {req.source_url && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-medium">参考URL：</span>
                                <a
                                  href={req.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800 hover:underline break-all inline-flex items-center gap-1"
                                >
                                  <span>{req.source_url}</span>
                                  <span>↗</span>
                                </a>
                              </div>
                            )}

                            {req.contact_url && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-medium">連絡希望URL：</span>
                                <a
                                  href={req.contact_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-900 hover:underline break-all inline-flex items-center gap-1 font-mono"
                                >
                                  <span>{req.contact_url}</span>
                                  <span>↗</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* タブ切り替えバー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => {
                setCurrentTab("politicians");
                setSelectedThemeFilter("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${currentTab === "politicians"
                  ? "bg-gradient-to-r from-[#217559] to-[#288365] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>議員データ管理</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${currentTab === "politicians"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                {politicians.length}件
              </span>
            </button>
            <button
              onClick={() => {
                setCurrentTab("policies");
                setSelectedThemeFilter("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${currentTab === "policies"
                  ? "bg-gradient-to-r from-[#217559] to-[#288365] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>制度紹介データ管理</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${currentTab === "policies"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                {policies.length}件
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={isLoadingData}
              title="最新データを再読み込み"
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isLoadingData ? "animate-spin" : ""}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>

            {currentTab === "politicians" ? (
              <button
                onClick={openNewPoliticianModal}
                className="px-4 py-2.5 bg-gradient-to-r from-[#217559] to-[#2ca880] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:opacity-95 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>新しい議員を登録</span>
              </button>
            ) : (
              <button
                onClick={openNewPolicyModal}
                className="px-4 py-2.5 bg-gradient-to-r from-[#217559] to-[#2ca880] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:opacity-95 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>新しい制度を登録</span>
              </button>
            )}
          </div>
        </div>

        {/* 検索・絞り込みバー */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentTab === "politicians"
                  ? "氏名、政党、都道府県、概要、カード番号などで検索..."
                  : "制度名、都道府県、市区町村、説明文などで検索..."
              }
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 focus:border-[#288365] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedThemeFilter}
              onChange={(e) => setSelectedThemeFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 text-slate-700"
            >
              <option value="all">すべてのテーマ</option>
              {currentTab === "politicians"
                ? THEME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
                : POLICY_THEME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>

            {(searchQuery || selectedThemeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedThemeFilter("all");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 whitespace-nowrap"
              >
                クリア
              </button>
            )}
          </div>
        </div>

        {/* ── 議員データ一覧 ── */}
        {currentTab === "politicians" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                登録一覧（表示中: {filteredPoliticians.length}件 / 全{politicians.length}件）
              </span>
            </div>

            {filteredPoliticians.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                条件に一致する議員データが見つかりませんでした。
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200 text-[11px] sm:text-xs">
                      <th className="py-3 px-4 font-semibold w-16">ID</th>
                      <th className="py-3 px-4 font-semibold w-24">カード番号</th>
                      <th className="py-3 px-4 font-semibold">氏名・所属</th>
                      <th className="py-3 px-4 font-semibold hidden md:table-cell">地域・種別</th>
                      <th className="py-3 px-4 font-semibold hidden lg:table-cell">質問日</th>
                      <th className="py-3 px-4 font-semibold hidden sm:table-cell">テーマ</th>
                      <th className="py-3 px-4 font-semibold hidden xl:table-cell">個別Xポスト</th>
                      <th className="py-3 px-4 font-semibold text-right w-28">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPoliticians.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                          {p.id}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium text-xs">
                          {p.cardNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                            {p.followUps && p.followUps.length > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                ✨ 続報 {p.followUps.length}件
                              </span>
                            )}
                          </div>
                          {p.kana && <div className="text-[11px] text-slate-400">{p.kana}</div>}
                          <div className="text-xs text-slate-600 mt-0.5">
                            <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-medium mr-1.5">
                              {p.party}
                            </span>
                            <span className="text-slate-400">{p.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap text-xs text-slate-600">
                          <div>{p.prefecture}</div>
                          <div className="text-[11px] text-slate-400">{p.chamber}</div>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap text-xs text-slate-600">
                          {p.questionDate}
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.themes.map((t) => (
                              <span
                                key={t}
                                className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-[#e8f6f0] text-[#1b6b50] rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden xl:table-cell text-xs">
                          {p.xPostUrl ? (
                            <a
                              href={p.xPostUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 max-w-[180px] truncate"
                              title={p.xPostUrl}
                            >
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              <span>個別ポスト設定済</span>
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">未設定（TOPへ）</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditPoliticianModal(p)}
                            className="text-xs font-semibold text-[#217559] hover:text-[#18533f] px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition mr-1"
                          >
                            編集
                          </button>
                          <button
                            onClick={() =>
                              setDeletingItem({ type: "politician", id: p.id, name: p.name })
                            }
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 制度紹介データ一覧 ── */}
        {currentTab === "policies" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                登録一覧（表示中: {filteredPolicies.length}件 / 全{policies.length}件）
              </span>
            </div>

            {filteredPolicies.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                条件に一致する制度データが見つかりませんでした。
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200 text-[11px] sm:text-xs">
                      <th className="py-3 px-4 font-semibold w-24">ID</th>
                      <th className="py-3 px-4 font-semibold w-28">地域</th>
                      <th className="py-3 px-4 font-semibold">制度名・概要</th>
                      <th className="py-3 px-4 font-semibold hidden md:table-cell w-56">テーマ分類</th>
                      <th className="py-3 px-4 font-semibold hidden lg:table-cell w-40">出典</th>
                      <th className="py-3 px-4 font-semibold text-right w-28">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPolicies.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap text-xs">
                          {p.id}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                          <span className="font-semibold">{p.pref}</span>
                          {p.municipality && (
                            <span className="text-slate-500 block text-[11px]">{p.municipality}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-bold text-slate-800 text-sm mb-1">{p.name}</div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {p.body}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-xs">
                          <span className="inline-block px-2 py-1 text-[11px] font-medium bg-[#e8f6f0] text-[#1b6b50] rounded-lg">
                            {p.theme}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-600">
                          {p.sourceUrl ? (
                            <a
                              href={p.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{p.sourceLabel}</span>
                              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          ) : (
                            <span>{p.sourceLabel}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditPolicyModal(p)}
                            className="text-xs font-semibold text-[#217559] hover:text-[#18533f] px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition mr-1"
                          >
                            編集
                          </button>
                          <button
                            onClick={() =>
                              setDeletingItem({ type: "policy", id: p.id, name: p.name })
                            }
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 議員 新規・編集モーダル ── */}
      {isPoliticianModalOpen && editingPolitician && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">
                  {isNewPoliticianMode
                    ? "新しい議員データの登録"
                    : `議員データの編集 (ID: ${editingPolitician.id})`}
                </h2>
                {isNewPoliticianMode && draftRestoredNotice && (
                  <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    下書きを復元しました
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsPoliticianModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* ── テキストから一括自動入力エリア ── */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-sky-50/60 border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#217559] text-white text-xs shadow-xs">
                    ✨
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-[#18533f]">
                    テキストから一括自動入力
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700/80 bg-white/70 px-2 py-0.5 rounded-full border border-emerald-100">
                  Muse / 議会テキスト対応
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mb-2.5 leading-relaxed">
                原稿やメモ、Museで作成したテキストをそのまま貼り付けて「自動入力する」を押すと、氏名・ふりがな・政党・質問日・テーマ・概要などを各フィールドへ自動で振り分けます。
              </p>
              <textarea
                rows={3}
                value={rawTextToParse}
                onChange={(e) => setRawTextToParse(e.target.value)}
                placeholder="ここにテキストを貼り付け（例: 紹介カード 29 / 氏名: 山田太郎 (やまだ たろう) / 政党: 立憲民主党 / 質問日: 2026年3月9日 / テーマ: 早産児支援 / 概要: ... / X: https://x.com/...）"
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/30 text-slate-700 placeholder-slate-400 leading-relaxed font-sans"
              />
              <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoParsePolitician}
                    className="px-3.5 py-1.5 bg-[#217559] hover:bg-[#18533f] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✨ 自動入力する</span>
                  </button>
                  {rawTextToParse && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawTextToParse("");
                        setParseFeedback(null);
                      }}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      クリア
                    </button>
                  )}
                </div>

                {parseFeedback && (
                  <div className="text-[11px] font-medium text-emerald-800 bg-white/95 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{parseFeedback}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSavePolitician} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ID（2桁番号） <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPolitician.id || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, id: e.target.value })
                    }
                    placeholder="例: 29"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">カード番号表示</label>
                  <input
                    type="text"
                    value={editingPolitician.cardNo || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, cardNo: e.target.value })
                    }
                    placeholder="例: 紹介カード 29"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    氏名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPolitician.name || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, name: e.target.value })
                    }
                    placeholder="例: 山田 太郎"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ふりがな</label>
                  <input
                    type="text"
                    value={editingPolitician.kana || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, kana: e.target.value })
                    }
                    placeholder="例: やまだ たろう"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    所属政党名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPolitician.party || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, party: e.target.value })
                    }
                    placeholder="例: 立憲民主党"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    政党分類（絞り込み用）
                  </label>
                  <select
                    value={editingPolitician.partyCategory || "その他"}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, partyCategory: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  >
                    {PARTY_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">議会種別</label>
                  <select
                    value={editingPolitician.chamber || "衆議院"}
                    onChange={(e) =>
                      setEditingPolitician({
                        ...editingPolitician,
                        chamber: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  >
                    {CHAMBER_OPTIONS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">肩書・選挙区</label>
                  <input
                    type="text"
                    value={editingPolitician.title || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, title: e.target.value })
                    }
                    placeholder="例: 衆議院議員（比例近畿）"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">区分テキスト</label>
                  <input
                    type="text"
                    value={editingPolitician.divisionText || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, divisionText: e.target.value })
                    }
                    placeholder="例: 国会｜国会（衆議院）"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">都道府県 / 国会</label>
                  <input
                    type="text"
                    value={editingPolitician.prefecture || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, prefecture: e.target.value })
                    }
                    placeholder="例: 国会 または 東京都"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">質問日</label>
                  <input
                    type="text"
                    value={editingPolitician.questionDate || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, questionDate: e.target.value })
                    }
                    placeholder="例: 2026年3月9日"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">質問年（西暦）</label>
                  <input
                    type="number"
                    value={editingPolitician.questionYear || 2026}
                    onChange={(e) =>
                      setEditingPolitician({
                        ...editingPolitician,
                        questionYear: parseInt(e.target.value) || 2026,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  関連テーマ（複数選択可）
                </label>
                <div className="flex flex-wrap gap-3">
                  {THEME_OPTIONS.map((theme) => {
                    const checked = (editingPolitician.themes || []).includes(theme);
                    return (
                      <label
                        key={theme}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${checked
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const cur = editingPolitician.themes || [];
                            if (e.target.checked) {
                              setEditingPolitician({
                                ...editingPolitician,
                                themes: [...cur, theme],
                              });
                            } else {
                              setEditingPolitician({
                                ...editingPolitician,
                                themes: cur.filter((t) => t !== theme),
                              });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{theme}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  紹介文 / 概要
                </label>
                <textarea
                  rows={4}
                  value={editingPolitician.summary || ""}
                  onChange={(e) =>
                    setEditingPolitician({ ...editingPolitician, summary: e.target.value })
                  }
                  placeholder="国会や地方議会での質疑内容、具体的な発言、取り組みの概要を入力してください。"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">出典名</label>
                  <input
                    type="text"
                    value={editingPolitician.sourceTitle || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, sourceTitle: e.target.value })
                    }
                    placeholder="例: 衆議院 予算委員会"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">出典URL</label>
                  <input
                    type="url"
                    value={editingPolitician.sourceUrl || ""}
                    onChange={(e) =>
                      setEditingPolitician({ ...editingPolitician, sourceUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>個別X紹介ポストURL（xPostUrl）</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    空欄の場合は公式Xアカウントトップへリンクします
                  </span>
                </label>
                <input
                  type="url"
                  value={editingPolitician.xPostUrl || ""}
                  onChange={(e) =>
                    setEditingPolitician({ ...editingPolitician, xPostUrl: e.target.value })
                  }
                  placeholder="https://x.com/lsvsince2026/status/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-mono text-xs text-sky-700"
                />
              </div>

              {/* ── 続報（複数回の議会発言）セクション ── */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>✨</span>
                      <span>続報・その後の議会発言（複数登録可）</span>
                      <span className="text-xs font-normal text-slate-500">
                        （{(editingPolitician.followUps || []).length}件）
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      同じ議員による2回目以降の議会質問やフォローアップ発言を追加できます
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFollowUp}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>＋</span>
                    <span>手動で追加</span>
                  </button>
                </div>

                {/* ── テキスト・URLから続報を自動取り込みエリア ── */}
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-pink-50/50 border border-purple-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#8370AF] text-white text-xs shadow-xs">
                        ✨
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-purple-900">
                        テキスト・URLから続報を自動取り込み
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700/80 bg-white/80 px-2 py-0.5 rounded-full border border-purple-100 font-medium">
                      Muse / 議事録要約テキスト対応
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mb-2.5 leading-relaxed">
                    Muse等で作成した要約テキストと出典URLを貼り付けると、質問日・会議名・要約本文・出典リンクを自動判別して新しい続報として追加します（要約文は改変せずそのままセットされます）。
                  </p>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={rawFollowUpText}
                      onChange={(e) => setRawFollowUpText(e.target.value)}
                      placeholder="要約テキストを貼り付け（例: 質問日: 2026年10月30日 / 会議名: 衆議院・厚生労働委員会 / 内容: ... または要約文のみの貼り付けもOK）"
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-slate-700 placeholder-slate-400 leading-relaxed font-sans"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        value={rawFollowUpUrl}
                        onChange={(e) => setRawFollowUpUrl(e.target.value)}
                        placeholder="出典URL（任意：テキスト内にURLが含まれている場合は空欄で自動抽出）"
                        className="flex-1 w-full px-3 py-2 text-xs bg-white border border-purple-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-slate-700 font-mono text-[11px]"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={handleAutoParseFollowUp}
                          className="px-4 py-2 bg-[#8370AF] hover:bg-[#725e9e] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <span>✨ 取り込んで続報に追加</span>
                        </button>
                        {(rawFollowUpText || rawFollowUpUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              setRawFollowUpText("");
                              setRawFollowUpUrl("");
                              setFollowUpParseFeedback(null);
                            }}
                            className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          >
                            クリア
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {followUpParseFeedback && (
                    <div className="mt-2.5 text-[11px] font-medium text-purple-900 bg-white/95 border border-purple-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{followUpParseFeedback}</span>
                    </div>
                  )}
                </div>

                {(!editingPolitician.followUps || editingPolitician.followUps.length === 0) ? (
                  <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                    まだ続報はありません。「＋ 続報を追加する」ボタンから複数回の発言を追加できます。
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {editingPolitician.followUps.map((fu, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/40 via-white to-pink-50/20 border border-purple-100/90 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-purple-100/60">
                          <span className="text-xs font-extrabold text-[#8370AF] flex items-center gap-1">
                            <span>#{idx + 1}</span>
                            <span>続報データ</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFollowUp(idx)}
                            className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1"
                          >
                            <span>✕ 削除</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              質問日・開催日 <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={fu.date}
                              onChange={(e) => handleUpdateFollowUp(idx, "date", e.target.value)}
                              placeholder="例: 2026年10月30日"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              会議名・委員会名
                            </label>
                            <input
                              type="text"
                              value={fu.committee}
                              onChange={(e) => handleUpdateFollowUp(idx, "committee", e.target.value)}
                              placeholder="例: 衆議院・厚生労働委員会"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            質問と答弁の要約テキスト <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={fu.summary}
                            onChange={(e) => handleUpdateFollowUp(idx, "summary", e.target.value)}
                            placeholder="その後の議会質疑の要約や進展内容を入力してください。"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              出典リンク表示名
                            </label>
                            <input
                              type="text"
                              value={fu.sourceLabel || ""}
                              onChange={(e) => handleUpdateFollowUp(idx, "sourceLabel", e.target.value)}
                              placeholder="例: 衆議院 会議録"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              出典URL
                            </label>
                            <input
                              type="url"
                              value={fu.sourceUrl || ""}
                              onChange={(e) => handleUpdateFollowUp(idx, "sourceUrl", e.target.value)}
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  {isNewPoliticianMode && (
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="text-xs text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center gap-1.5 py-1"
                      title="保存されている下書きを破棄して入力欄を初期状態に戻します"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>下書きをクリア</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPoliticianModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPolitician}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#217559] to-[#2ca880] text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingPolitician ? (
                      <>
                        <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        保存中...
                      </>
                    ) : (
                      "保存する"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 制度紹介 新規・編集モーダル ── */}
      {isPolicyModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {policies.some((p) => p.id === editingPolicy.id)
                  ? `制度データの編集 (ID: ${editingPolicy.id})`
                  : "新しい制度データの登録"}
              </h2>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.id || ""}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, id: e.target.value })
                    }
                    placeholder="例: 制度紹介 10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    都道府県 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.pref || ""}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, pref: e.target.value })
                    }
                    placeholder="例: 青森県 または 全国"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    市区町村（任意）
                  </label>
                  <input
                    type="text"
                    value={editingPolicy.municipality || ""}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, municipality: e.target.value })
                    }
                    placeholder="例: 五所川原市"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  制度名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingPolicy.name || ""}
                  onChange={(e) =>
                    setEditingPolicy({ ...editingPolicy, name: e.target.value })
                  }
                  placeholder="例: 周産期母子医療センター アクセス支援事業"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  テーマ分類 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editingPolicy.theme || POLICY_THEME_OPTIONS[0]}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      theme: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-medium text-emerald-800"
                >
                  {POLICY_THEME_OPTIONS.map((thm) => (
                    <option key={thm} value={thm}>
                      {thm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  制度の概要・説明文 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingPolicy.body || ""}
                  onChange={(e) =>
                    setEditingPolicy({ ...editingPolicy, body: e.target.value })
                  }
                  placeholder="対象者、支援金額、申請方法や特徴などを分かりやすく入力してください。"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">出典表示名</label>
                  <input
                    type="text"
                    value={editingPolicy.sourceLabel || ""}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, sourceLabel: e.target.value })
                    }
                    placeholder="例: 五所川原市の案内、鳥取県公式ページ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">出典URL</label>
                  <input
                    type="url"
                    value={editingPolicy.sourceUrl || ""}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, sourceUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#288365]/20 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPolicy}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#217559] to-[#2ca880] text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingPolicy ? (
                    <>
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      保存中...
                    </>
                  ) : (
                    "保存する"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 削除確認モーダル（誤操作防止カスタムモーダル） ── */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-rose-200 text-center animate-in fade-in zoom-in-95 duration-150">
            {/* 警告アイコン */}
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-3">
              {deletingItem.type === "politician"
                ? "議員データの削除確認"
                : deletingItem.type === "policy"
                  ? "制度データの削除確認"
                  : "依頼データの削除確認"}
            </span>

            {/* 赤字・強調の確認メッセージ */}
            <div className="mb-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
              <p className="text-base sm:text-lg font-extrabold text-rose-700 leading-snug">
                本当に【{deletingItem.name}】を削除しますか？
              </p>
              <p className="text-sm font-bold text-rose-600 mt-2 flex items-center justify-center gap-1.5">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>この操作は取り消せません。</span>
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                データベースから完全に削除され、公開サイト（トップページや制度一覧）からも即座に非表示となります。
              </p>
            </div>

            {/* ボタン配置：誤タップを防ぐため左右に離して配置 */}
            <div className="flex items-center justify-between gap-4 sm:gap-6 pt-1">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    削除中...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>完全に削除する</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
