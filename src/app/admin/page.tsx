"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Politician } from "@/data/politicians";
import { Policy, PolicyTheme } from "@/lib/policies-data";

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
  "自民",
  "立憲",
  "公明",
  "維新",
  "共産",
  "国民",
  "れいわ",
  "社民",
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
    if (p.includes("自民")) result.partyCategory = "自民";
    else if (p.includes("立憲")) result.partyCategory = "立憲";
    else if (p.includes("公明")) result.partyCategory = "公明";
    else if (p.includes("維新")) result.partyCategory = "維新";
    else if (p.includes("共産")) result.partyCategory = "共産";
    else if (p.includes("国民")) result.partyCategory = "国民";
    else if (p.includes("れいわ")) result.partyCategory = "れいわ";
    else if (p.includes("社民")) result.partyCategory = "社民";
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

  // ── 制度モーダル（追加／編集） ──
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy> | null>(null);
  const [isSubmittingPolicy, setIsSubmittingPolicy] = useState(false);

  // ── 削除確認ダイアログ ──
  const [deletingItem, setDeletingItem] = useState<{ type: "politician" | "policy"; id: string; name: string } | null>(null);
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
      const [resPol, resPlc] = await Promise.all([
        fetch("/api/admin/politicians"),
        fetch("/api/admin/policies"),
      ]);

      if (resPol.ok) {
        const dataPol = await resPol.json();
        setPoliticians(dataPol.politicians || []);
      }
      if (resPlc.ok) {
        const dataPlc = await resPlc.json();
        setPolicies(dataPlc.policies || []);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "データ取得に失敗しました: " + (err?.message || "通信エラー") });
    } finally {
      setIsLoadingData(false);
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
        partyCategory: "自民",
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
      });
    }

    setIsPoliticianModalOpen(true);
  }

  function openEditPoliticianModal(p: Politician) {
    setIsNewPoliticianMode(false);
    setDraftRestoredNotice(false);
    setRawTextToParse("");
    setParseFeedback(null);
    setEditingPolitician({ ...p });
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
      partyCategory: "自民",
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
    });
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
          : `/api/admin/policies?id=${encodeURIComponent(deletingItem.id)}`;

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
            className={`mb-6 p-4 rounded-2xl border text-sm flex items-start justify-between gap-3 shadow-xs ${
              message.type === "success"
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

        {/* タブ切り替えバー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => {
                setCurrentTab("politicians");
                setSelectedThemeFilter("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                currentTab === "politicians"
                  ? "bg-gradient-to-r from-[#217559] to-[#288365] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>議員データ管理</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "politicians"
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
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                currentTab === "policies"
                  ? "bg-gradient-to-r from-[#217559] to-[#288365] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>制度紹介データ管理</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "policies"
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
                          <div className="font-bold text-slate-800 text-sm">{p.name}</div>
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
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          checked
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

      {/* ── 削除確認モーダル ── */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">データを削除しますか？</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              「<span className="font-semibold text-slate-700">{deletingItem.name}</span>」をデータベースから完全に削除します。この操作は元に戻せません。
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    削除中...
                  </>
                ) : (
                  "削除を実行"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
