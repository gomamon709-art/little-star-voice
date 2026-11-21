import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase";

export interface CorrectionRequestRow {
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

// 全件取得（新しい順）
export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("correction_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data as CorrectionRequestRow[] });
}

// ステータス更新（対応済み／未対応の切り替え）
export async function PATCH(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "IDとステータスは必須です。" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("correction_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "更新に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "削除するIDが指定されていません。" }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from("correction_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "削除中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
