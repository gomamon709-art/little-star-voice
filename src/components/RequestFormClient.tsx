"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type RequestType = "情報の訂正・更新" | "掲載の削除依頼" | "新しい発言の情報提供";
type SenderRole = "議員ご本人・事務所関係者" | "一般の閲覧者・当事者家族" | "その他";

export function RequestFormClient() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || "";

  const [requestType, setRequestType] = useState<RequestType>("情報の訂正・更新");
  const [targetPolitician, setTargetPolitician] = useState(initialTarget);
  const [senderRole, setSenderRole] = useState<SenderRole>("一般の閲覧者・当事者家族");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [contactUrl, setContactUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // URLパラメータが変わった場合に反映
  useEffect(() => {
    if (initialTarget && !targetPolitician) {
      setTargetPolitician(initialTarget);
    }
  }, [initialTarget]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!targetPolitician.trim()) {
      setErrorMessage("対象の議員名・カード番号を入力してください。");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("具体的な内容を入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          targetPolitician,
          senderRole,
          content,
          sourceUrl,
          contactUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "送信に失敗しました。時間をおいて再送してください。");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── 送信完了画面 ──
  if (isSubmitted) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9be3cb] to-[#bfe4fa] flex items-center justify-center text-[#1b6b50] mx-auto mb-4 shadow-2xs text-2xl font-bold">
          ✨
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2.5">
          送信が完了いたしました
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
          情報をお寄せいただき誠にありがとうございます。いただいた内容を確認のうえ、迅速に対応・更新いたします。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#217559] to-[#2ca880] text-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all"
          >
            ← トップページへ戻る
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setContent("");
              setSourceUrl("");
              setContactUrl("");
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs sm:text-sm transition-all"
          >
            続けて別の依頼を送る
          </button>
        </div>
      </div>
    );
  }

  // ── 入力フォーム画面 ──
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 border border-purple-100 shadow-sm">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <span className="text-rose-500 font-bold">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* 1. 依頼の種類 */}
        <div>
          <label className="block font-bold text-slate-800 mb-2">
            1. 依頼の種類 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(
              [
                "情報の訂正・更新",
                "掲載の削除依頼",
                "新しい発言の情報提供",
              ] as RequestType[]
            ).map((type) => {
              const isSelected = requestType === type;
              return (
                <label
                  key={type}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-50/90 border-purple-300 text-purple-900 shadow-2xs"
                      : "bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="requestType"
                    value={type}
                    checked={isSelected}
                    onChange={() => setRequestType(type)}
                    className="text-purple-600 focus:ring-purple-400"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. 対象の議員名・カード番号 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bold text-slate-800">
              2. 対象の議員名・カード番号 <span className="text-rose-500">*</span>
            </label>
            {initialTarget && (
              <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                カードから自動指定済
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={targetPolitician}
            onChange={(e) => setTargetPolitician(e.target.value)}
            placeholder="例：山田太郎（紹介カード 15）、○○市議会議員 など"
            className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* 3. ご依頼者のお立場 */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            3. ご依頼者のお立場 <span className="text-rose-500">*</span>
          </label>
          <select
            value={senderRole}
            onChange={(e) => setSenderRole(e.target.value as SenderRole)}
            className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all text-slate-800 cursor-pointer"
          >
            <option value="議員ご本人・事務所関係者">議員ご本人・事務所関係者</option>
            <option value="一般の閲覧者・当事者家族">一般の閲覧者・当事者家族</option>
            <option value="その他">その他</option>
          </select>
        </div>

        {/* 4. 具体的な内容 */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            4. 具体的な内容 <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="訂正すべき箇所、新しい発言や取り組みの詳細、または掲載削除をご希望される理由などをご記入ください。"
            className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all text-slate-800 leading-relaxed"
          />
        </div>

        {/* 5. 参考URL（任意） */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            5. 参考URL <span className="text-xs text-slate-400 font-normal">（任意）</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://... （議会会議録、議員公式HP、報道記事などのURL）"
            className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all text-slate-800 font-mono text-xs"
          />
        </div>

        {/* 6. 完了連絡を希望する場合の公開SNS・公式サイトURL（任意） */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            6. 完了連絡を希望する場合の公開SNS・公式サイトURL <span className="text-xs text-slate-400 font-normal">（任意）</span>
          </label>
          <input
            type="url"
            value={contactUrl}
            onChange={(e) => setContactUrl(e.target.value)}
            placeholder="例：https://x.com/...（X・Instagramや公式サイトなど公開ページのURL）"
            className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all text-slate-800 font-mono text-xs"
          />
          <div className="mt-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            ※個人情報保護のため、お名前やメールアドレス・電話番号などの個人情報は取得しておりません。完了連絡をご希望の場合は、公開されているSNSアカウントや公式サイトのURLをご記載ください（すべてのご依頼への個別返信はお約束いたしかねます）。
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[220px] py-3 px-8 rounded-full bg-gradient-to-r from-[#217559] to-[#2ca880] text-white font-bold text-sm shadow-md hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <span>送信する</span>
                <span>✨</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
