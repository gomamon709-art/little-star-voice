import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestType, targetPolitician, senderRole, content, sourceUrl, email } = body;

    // バリデーション
    if (!requestType || !targetPolitician || !senderRole || !content) {
      return NextResponse.json(
        { error: "必須項目が入力されていません。" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const insertData = {
      request_type: requestType,
      target_politician: targetPolitician,
      sender_role: senderRole,
      content: content,
      source_url: sourceUrl || null,
      email: email || null,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("correction_requests")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: `保存処理に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました。";
    console.error("Request API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
