import { getPoliticians } from "@/lib/supabase";
import { HomePageClient } from "@/components/HomePageClient";

// 常に最新データを取得する設定
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const politicians = await getPoliticians();
  return <HomePageClient initialPoliticians={politicians} />;
}
