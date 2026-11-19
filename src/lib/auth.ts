import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lsv2026";
const COOKIE_NAME = "lsv_admin_token";

// 管理者トークン生成（パスワードとシークレットからハッシュ）
export function generateAdminToken(): string {
  return crypto
    .createHmac("sha256", "lsv-admin-secret-salt-2026")
    .update(ADMIN_PASSWORD)
    .digest("hex");
}

// パスワードの検証
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// リクエストが管理者として認証されているか検証
export function isAuthenticatedAdmin(request: NextRequest): boolean {
  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;
  return token === generateAdminToken();
}

// 認証Cookieの設定
export function setAdminCookie(response: NextResponse): void {
  const token = generateAdminToken();
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日間有効
  });
}

// 認証Cookieのクリア（ログアウト）
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}
