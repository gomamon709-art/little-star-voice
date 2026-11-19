import { getPolicies } from "@/lib/supabase";
import { AboutPageClient } from "@/components/AboutPageClient";

// 常に最新データを取得する設定
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const policies = await getPolicies();
  return <AboutPageClient initialPolicies={policies} />;
}
