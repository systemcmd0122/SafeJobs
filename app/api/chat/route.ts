import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import type { AnalysisResult } from "@/types/analysis"

// Gemini APIの設定
const API_KEY = process.env.GEMINI_API_KEY

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not set in environment variables" }, { status: 500 })
    }

    const { message, analysisResult, history } = await request.json()

    if (!message || !analysisResult) {
      return NextResponse.json({ error: "メッセージと分析結果が必要です" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 分析結果の要約を作成
    const resultSummary = createAnalysisSummary(analysisResult)

    // チャット履歴を整形
    const formattedHistory = formatChatHistory(history)

    // プロンプトを構築
    const prompt = `
あなたは求人安全性分析AIアシスタントです。ユーザーの求人分析結果について質問に答えます。
以下の分析結果に基づいて、ユーザーの質問に日本語で回答してください。

## 分析結果の要約:
${resultSummary}

## ユーザーの質問:
${message}

回答は簡潔かつ具体的に、専門的な知識を活かして行ってください。
分析結果に含まれていない情報については、一般的な求人安全性の知識に基づいて回答してください。
ただし、分析結果にない具体的な情報については「分析結果にはその詳細情報がありません」と伝えてください。
`

    // チャット履歴がある場合は追加
    const fullPrompt = formattedHistory ? `${formattedHistory}\n\n${prompt}` : prompt

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error during chat:", error)
    return NextResponse.json(
      { error: "Chat failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// 分析結果の要約を作成する関数
function createAnalysisSummary(result: AnalysisResult): string {
  const analysisResult = result.analysisResult

  return `
安全性: ${analysisResult.isSafe ? "安全" : "危険"}
安全性スコア: ${analysisResult.safetyScore}/100
確信度: ${analysisResult.confidenceLevel}%

危険シグナル:
- 非現実的な高額報酬: ${analysisResult.redFlags.unrealisticPay ? "あり" : "なし"}
- 会社情報の欠如: ${analysisResult.redFlags.lackOfCompanyInfo ? "あり" : "なし"}
- 個人情報の不審な要求: ${analysisResult.redFlags.requestForPersonalInfo ? "あり" : "なし"}
- 曖昧な仕事内容: ${analysisResult.redFlags.unclearJobDescription ? "あり" : "なし"}
- 違法行為の示唆: ${analysisResult.redFlags.illegalActivity ? "あり" : "なし"}

警告フラグ: ${analysisResult.warningFlags.length > 0 ? analysisResult.warningFlags.join(", ") : "なし"}

安全性分析: ${analysisResult.safetyAnalysis}

懸念事項: ${analysisResult.reasonsForConcern.length > 0 ? analysisResult.reasonsForConcern.join(", ") : "なし"}

法的問題点: ${analysisResult.legalIssues.length > 0 ? analysisResult.legalIssues.join(", ") : "なし"}

推奨される行動: ${analysisResult.recommendedActions.length > 0 ? analysisResult.recommendedActions.join(", ") : "なし"}

代替求人の提案: ${analysisResult.alternativeJobSuggestions.length > 0 ? analysisResult.alternativeJobSuggestions.join(", ") : "なし"}

求人内容: ${result.jobDescription}
`
}

// チャット履歴を整形する関数
function formatChatHistory(history: Message[]): string {
  if (!history || history.length <= 1) return ""

  // 最初のウェルカムメッセージを除外
  const relevantHistory = history.slice(1)

  if (relevantHistory.length === 0) return ""

  return (
    "## 過去の会話:\n" +
    relevantHistory
      .map((msg) => {
        const role = msg.role === "user" ? "ユーザー" : "アシスタント"
        return `${role}: ${msg.content}`
      })
      .join("\n\n")
  )
}

