import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { validateAndCompleteData } from "@/lib/analysis-utils"
import { saveAnalysisToSupabase } from "@/lib/supabase"
import type { AnalysisResult } from "@/types/analysis"

// Gemini APIの設定
const API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not set in environment variables" }, { status: 500 })
    }

    const { jobDescription, saveToHistory = false } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: "求人内容が必要です" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
あなたは闇バイト（違法・犯罪に関連するアルバイト）を検出する専門家です。
以下の求人情報が安全な正規のアルバイトか、危険な闇バイトかを詳細に分析してください。

求人情報:
"""
${jobDescription}
"""

分析の際は以下の点に特に注意してください：
1. 非現実的に高い報酬（時給3000円以上、日給3万円以上など）
2. 会社情報や雇用条件の不明確さ
3. 応募前の個人情報の要求
4. 曖昧な仕事内容や説明
5. 違法行為や犯罪に関連する可能性のある表現
6. 「即日払い」「身分証のみ」「LINE登録」などの怪しい表現
7. 「身バレ防止」「ノンアダルト」などの表現
8. 「簡単」「楽に稼げる」などの誇大表現

以下の形式でJSON形式で回答してください。全ての項目を省略せず含めてください:
{
  "isSafe": boolean, // 安全な求人かどうか
  "safetyScore": number, // 0-100の安全性スコア（高いほど安全）
  "warningFlags": [string], // 警告フラグのリスト
  "reasonsForConcern": [string], // 懸念事項のリスト
  "legalIssues": [string], // 法的問題点のリスト
  "redFlags": { // 危険シグナル
      "unrealisticPay": boolean, // 非現実的な高額報酬
      "lackOfCompanyInfo": boolean, // 会社情報の欠如
      "requestForPersonalInfo": boolean, // 個人情報の不審な要求
      "unclearJobDescription": boolean, // 曖昧な仕事内容
      "illegalActivity": boolean // 違法行為の示唆
  },
  "safetyAnalysis": string, // 詳細な安全性分析（300文字以上）
  "recommendedActions": [string], // 推奨される行動のリスト
  "alternativeJobSuggestions": [string], // 代替求人の提案
  "confidenceLevel": number // 0-100の分析確信度（高いほど確実）
}

回答は必ずJSON形式のみとし、前後に余計な文章を含めないでください。`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSON部分の抽出と解析
    let jsonData
    try {
      // まず、コードブロック内のJSONを探す
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1].trim())
      } else {
        // コードブロックがない場合は、テキスト全体をJSONとして解析
        jsonData = JSON.parse(text)
      }
    } catch (error) {
      console.error("JSON解析エラー:", error)
      console.log("AIからの応答:", text)

      // フォールバック: デフォルトの分析結果を生成
      jsonData = {
        isSafe: false,
        safetyScore: 30,
        warningFlags: ["AIによる分析に失敗しました。手動での確認をお勧めします。"],
        reasonsForConcern: ["AIによる分析結果を正確に解析できませんでした。"],
        legalIssues: [],
        redFlags: {
          unrealisticPay: false,
          lackOfCompanyInfo: true,
          requestForPersonalInfo: false,
          unclearJobDescription: true,
          illegalActivity: false,
        },
        safetyAnalysis:
          "AIによる分析に技術的な問題が発生しました。この求人は自動的に「要注意」としてマークされています。手動での確認をお勧めします。",
        recommendedActions: [
          "この求人に応募する前に、会社の詳細情報を確認してください。",
          "応募前に企業の公式サイトや評判を調査してください。",
        ],
        alternativeJobSuggestions: ["公式の求人サイトや人材紹介会社を通じた求人を探してみてください。"],
        confidenceLevel: 30,
      }
    }

    // データの検証と補完
    validateAndCompleteData(jsonData)

    // 分析結果をSupabaseに保存（ユーザーが同意した場合のみ）
    let savedData
    if (saveToHistory) {
      savedData = await saveAnalysisToSupabase(jobDescription, jsonData)
    } else {
      // 保存しない場合は一時的なIDを生成
      savedData = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
    }

    // 保存したデータをAPIレスポンスの形式に変換
    const analysisResult: AnalysisResult = {
      id: savedData.id,
      timestamp: savedData.created_at,
      jobDescription: jobDescription,
      analysisResult: jsonData,
      filename: savedData.id, // filenameの代わりにidを使用
      savedToHistory: saveToHistory, // 履歴に保存されたかどうかのフラグを追加
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error during analysis:", error)
    return NextResponse.json(
      { error: "Analysis failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
