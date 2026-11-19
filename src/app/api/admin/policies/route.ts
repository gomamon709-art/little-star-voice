import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import {
  getAdminSupabase,
  policyFromRow,
  policyToRow,
  PolicyRow,
} from "@/lib/supabase";

// 全件取得
export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const policies = (data as PolicyRow[]).map(policyFromRow);
  return NextResponse.json({ policies });
}

// 新規作成
export async function POST(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id || !body.pref || !body.name || !body.body || !body.theme) {
      return NextResponse.json(
        { error: "ID、都道府県、制度名、内容説明、テーマは必須項目です。" },
        { status: 400 }
      );
    }

    const row = policyToRow(body);
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("policies")
      .insert(row)
      .select()
      .single();

    if (error) {
      if (error.code === "42501" || error.message.includes("row-level security")) {
        return NextResponse.json(
          {
            error:
              "SupabaseのRLS（書き込み権限）によってブロックされました。.env.localに SUPABASE_SERVICE_ROLE_KEY を追加するか、Supabase SQL Editorで書き込み許可ポリシーを追加してください。",
            details: error.message,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, policy: policyFromRow(data as PolicyRow) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "登録中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

// 更新
export async function PUT(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "IDが指定されていません。" }, { status: 400 });
    }

    const row = policyToRow(body);
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("policies")
      .update(row)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      if (error.code === "42501" || error.message.includes("row-level security")) {
        return NextResponse.json(
          {
            error:
              "SupabaseのRLS（書き込み権限）によってブロックされました。.env.localに SUPABASE_SERVICE_ROLE_KEY を追加するか、Supabase SQL Editorで書き込み許可ポリシーを追加してください。",
            details: error.message,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, policy: policyFromRow(data as PolicyRow) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "更新中にエラーが発生しました。" },
      { status: 500 }
    );
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
      .from("policies")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "42501" || error.message.includes("row-level security")) {
        return NextResponse.json(
          {
            error:
              "SupabaseのRLS（書き込み権限）によってブロックされました。.env.localに SUPABASE_SERVICE_ROLE_KEY を追加するか、Supabase SQL Editorで書き込み許可ポリシーを追加してください。",
            details: error.message,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "削除中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
