import { createClient } from "@supabase/supabase-js";
import { Politician, POLITICIANS_DATA } from "@/data/politicians";
import { Policy, POLICIES_FALLBACK } from "@/lib/policies-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 公開クライアント（ブラウザ・一般読み取り用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理用クライアント（サーバーAPI Route用）
export function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ─── 型定義（Supabase テーブル行） ────────────────────────────────
export interface PoliticianRow {
  id: string;
  card_no: string;
  name: string;
  kana?: string | null;
  party: string;
  party_category: string;
  chamber: "衆議院" | "参議院" | "地方議会";
  title: string;
  division_text: string;
  category?: string | null;
  prefecture: string;
  region?: string | null;
  question_date: string;
  question_year: number;
  themes: ("早産児支援" | "母乳バンク" | "付き添い入院")[];
  summary: string;
  full_content?: string | null;
  source_title?: string | null;
  source_url?: string | null;
  x_post_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PolicyRow {
  id: string;
  pref: string;
  municipality: string;
  name: string;
  body: string;
  source_label: string;
  source_url?: string | null;
  theme: "付き添い・面会の費用を支える" | "母乳バンク・ドナーミルクや搾乳を支える" | "早産児・低出生体重児支援";
  created_at?: string;
  updated_at?: string;
}

// ─── マッピング関数 ─────────────────────────────────────────────
export function politicianFromRow(row: PoliticianRow): Politician {
  return {
    id: row.id,
    cardNo: row.card_no,
    name: row.name,
    kana: row.kana || undefined,
    party: row.party,
    partyCategory: row.party_category,
    chamber: row.chamber,
    title: row.title,
    divisionText: row.division_text,
    category: row.category || undefined,
    prefecture: row.prefecture,
    region: row.region || undefined,
    questionDate: row.question_date,
    questionYear: row.question_year,
    themes: row.themes || [],
    summary: row.summary,
    fullContent: row.full_content || undefined,
    sourceTitle: row.source_title || undefined,
    sourceUrl: row.source_url || undefined,
    xPostUrl: row.x_post_url || undefined,
  };
}

export function politicianToRow(p: Partial<Politician>): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.cardNo !== undefined) row.card_no = p.cardNo;
  if (p.name !== undefined) row.name = p.name;
  if (p.kana !== undefined) row.kana = p.kana || null;
  if (p.party !== undefined) row.party = p.party;
  if (p.partyCategory !== undefined) row.party_category = p.partyCategory;
  if (p.chamber !== undefined) row.chamber = p.chamber;
  if (p.title !== undefined) row.title = p.title;
  if (p.divisionText !== undefined) row.division_text = p.divisionText;
  if (p.category !== undefined) row.category = p.category || null;
  if (p.prefecture !== undefined) row.prefecture = p.prefecture;
  if (p.region !== undefined) row.region = p.region || null;
  if (p.questionDate !== undefined) row.question_date = p.questionDate;
  if (p.questionYear !== undefined) row.question_year = Number(p.questionYear);
  if (p.themes !== undefined) row.themes = p.themes;
  if (p.summary !== undefined) row.summary = p.summary;
  if (p.fullContent !== undefined) row.full_content = p.fullContent || null;
  if (p.sourceTitle !== undefined) row.source_title = p.sourceTitle || null;
  if (p.sourceUrl !== undefined) row.source_url = p.sourceUrl || null;
  if (p.xPostUrl !== undefined) row.x_post_url = p.xPostUrl || null;
  return row;
}

export function policyFromRow(row: PolicyRow): Policy {
  return {
    id: row.id,
    pref: row.pref,
    municipality: row.municipality || "",
    name: row.name,
    body: row.body,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url || undefined,
    theme: row.theme,
  };
}

export function policyToRow(p: Partial<Policy>): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.pref !== undefined) row.pref = p.pref;
  if (p.municipality !== undefined) row.municipality = p.municipality || "";
  if (p.name !== undefined) row.name = p.name;
  if (p.body !== undefined) row.body = p.body;
  if (p.sourceLabel !== undefined) row.source_label = p.sourceLabel;
  if (p.sourceUrl !== undefined) row.source_url = p.sourceUrl || null;
  if (p.theme !== undefined) row.theme = p.theme;
  return row;
}

// ─── 取得ヘルパー（フォールバック付き） ────────────────────────────
export async function getPoliticians(): Promise<Politician[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return POLITICIANS_DATA;
    }
    const { data, error } = await supabase
      .from("politicians")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase politicians fetch failed, using fallback:", error?.message);
      return POLITICIANS_DATA;
    }
    return data.map(politicianFromRow);
  } catch (err) {
    console.warn("Supabase fetch exception, using fallback:", err);
    return POLITICIANS_DATA;
  }
}

export async function getPolicies(): Promise<Policy[]> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return POLICIES_FALLBACK;
    }
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase policies fetch failed, using fallback:", error?.message);
      return POLICIES_FALLBACK;
    }
    return data.map(policyFromRow);
  } catch (err) {
    console.warn("Supabase policies fetch exception, using fallback:", err);
    return POLICIES_FALLBACK;
  }
}
