import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  isAuthenticatedAdmin,
  setAdminCookie,
  clearAdminCookie,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authenticated = isAuthenticatedAdmin(request);
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      clearAdminCookie(res);
      return res;
    }

    if (action === "login") {
      if (!password || !verifyPassword(password)) {
        return NextResponse.json(
          { error: "パスワードが正しくありません。" },
          { status: 401 }
        );
      }

      const res = NextResponse.json({ success: true });
      setAdminCookie(res);
      return res;
    }

    return NextResponse.json({ error: "無効なリクエストです。" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
