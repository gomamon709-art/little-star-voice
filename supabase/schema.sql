-- ==========================================
-- little star voice ★ データベーススキーマ
-- Supabase用 schema.sql
-- ==========================================

-- 1. 議員テーブル (politicians)
create table if not exists public.politicians (
  id text primary key,                                           -- "01", "02" など
  card_no text not null,                                         -- "紹介カード 01" など
  name text not null,                                            -- 議員氏名
  kana text,                                                     -- ふりがな
  party text not null,                                           -- 所属政党・会派
  party_category text not null,                                  -- 絞り込み用政党カテゴリー
  chamber text not null check (chamber in ('衆議院', '参議院', '地方議会')), -- 議会区分
  title text not null,                                           -- 肩書・選挙区
  division_text text not null,                                   -- "国会｜国会（衆議院）" など
  category text,                                                 -- 任意分類
  prefecture text not null,                                      -- 都道府県または "国会"
  region text,                                                   -- 絞り込み地域
  question_date text not null,                                   -- 質問日（表示用テキスト）
  question_year integer not null,                                -- 質問年（ソート・絞り込み用数値）
  themes text[] not null default '{}',                           -- テーマ配列（"早産児支援", "母乳バンク", "付き添い入院"）
  summary text not null,                                         -- 概要・紹介文
  full_content text,                                             -- 詳細テキスト（任意）
  source_title text,                                             -- 出典ラベル（"〇〇議会 会議録" など）
  source_url text,                                               -- 出典URL
  x_post_url text,                                               -- X（旧Twitter）個別紹介ポストURL
  created_at timestamptz not null default now(),                 -- 作成日時
  updated_at timestamptz not null default now()                  -- 更新日時
);

-- 2. 制度紹介テーブル (policies)
create table if not exists public.policies (
  id text primary key,                                           -- "制度紹介 01" など
  pref text not null,                                            -- 都道府県
  municipality text not null default '',                         -- 市区町村（空文字可）
  name text not null,                                            -- 制度名
  body text not null,                                            -- 制度内容説明文
  source_label text not null,                                    -- 出典ラベル
  source_url text,                                               -- 出典URL
  theme text not null,                                           -- テーマ分類
  created_at timestamptz not null default now(),                 -- 作成日時
  updated_at timestamptz not null default now()                  -- 更新日時
);

-- 3. インデックス作成（パフォーマンス最適化）
create index if not exists idx_politicians_question_year on public.politicians(question_year desc);
create index if not exists idx_politicians_prefecture on public.politicians(prefecture);
create index if not exists idx_politicians_party_category on public.politicians(party_category);
create index if not exists idx_politicians_themes on public.politicians using gin(themes);
create index if not exists idx_policies_theme on public.policies(theme);
create index if not exists idx_policies_pref on public.policies(pref);

-- 4. updated_at 自動更新関数とトリガー
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_politicians_updated_at on public.politicians;
create trigger set_politicians_updated_at
  before update on public.politicians
  for each row execute function public.handle_updated_at();

drop trigger if exists set_policies_updated_at on public.policies;
create trigger set_policies_updated_at
  before update on public.policies
  for each row execute function public.handle_updated_at();

-- 5. Row Level Security (RLS) 設定
alter table public.politicians enable row level security;
alter table public.policies enable row level security;

-- 誰でも閲覧可能（Public Read）
drop policy if exists "Allow public read access on politicians" on public.politicians;
create policy "Allow public read access on politicians"
  on public.politicians for select
  using (true);

drop policy if exists "Allow public read access on policies" on public.policies;
create policy "Allow public read access on policies"
  on public.policies for select
  using (true);

-- 管理者用書き込みポリシー（service_roleまたは必要に応じた設定）
drop policy if exists "Allow authenticated full access on politicians" on public.politicians;
create policy "Allow authenticated full access on politicians"
  on public.politicians for all
  using (auth.role() = 'authenticated');

drop policy if exists "Allow authenticated full access on policies" on public.policies;
create policy "Allow authenticated full access on policies"
  on public.policies for all
  using (auth.role() = 'authenticated');
