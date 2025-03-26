import { createClient } from "@supabase/supabase-js"
import type { AnalysisResult } from "@/types/analysis"
import { mockAnalysisResults } from "./mock-data"

// Supabaseの環境変数
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// クライアントサイド用のSupabaseクライアント
export const supabaseClient = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "public-anon-key",
)

// サーバーサイド用のSupabaseクライアント（サービスロールキー使用）
export const supabaseAdmin = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseServiceKey || "service-role-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// 分析結果をSupabaseに保存する関数
export async function saveAnalysisToSupabase(jobDescription: string, analysisResult: any) {
  try {
    // 実際のSupabase接続がない場合はモックデータを返す
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Using mock data for saveAnalysisToSupabase")
      return {
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        job_description: jobDescription,
        is_safe: analysisResult.isSafe,
        safety_score: analysisResult.safetyScore,
        warning_flags: analysisResult.warningFlags,
        reasons_for_concern: analysisResult.reasonsForConcern,
        legal_issues: analysisResult.legalIssues,
        red_flags: analysisResult.redFlags,
        safety_analysis: analysisResult.safetyAnalysis,
        recommended_actions: analysisResult.recommendedActions,
        alternative_job_suggestions: analysisResult.alternativeJobSuggestions,
        confidence_level: analysisResult.confidenceLevel,
      }
    }

    const { data, error } = await supabaseAdmin
      .from("analysis_results")
      .insert({
        job_description: jobDescription,
        is_safe: analysisResult.isSafe,
        safety_score: analysisResult.safetyScore,
        warning_flags: analysisResult.warningFlags,
        reasons_for_concern: analysisResult.reasonsForConcern,
        legal_issues: analysisResult.legalIssues,
        red_flags: analysisResult.redFlags,
        safety_analysis: analysisResult.safetyAnalysis,
        recommended_actions: analysisResult.recommendedActions,
        alternative_job_suggestions: analysisResult.alternativeJobSuggestions,
        confidence_level: analysisResult.confidenceLevel,
      })
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Error saving analysis to Supabase:", error)
    // エラー時はモックデータを返す
    return {
      id: `error-${Date.now()}`,
      created_at: new Date().toISOString(),
      job_description: jobDescription,
      is_safe: analysisResult.isSafe,
      safety_score: analysisResult.safetyScore,
      warning_flags: analysisResult.warningFlags,
      reasons_for_concern: analysisResult.reasonsForConcern,
      legal_issues: analysisResult.legalIssues,
      red_flags: analysisResult.redFlags,
      safety_analysis: analysisResult.safetyAnalysis,
      recommended_actions: analysisResult.recommendedActions,
      alternative_job_suggestions: analysisResult.alternativeJobSuggestions,
      confidence_level: analysisResult.confidenceLevel,
    }
  }
}

// 過去の分析結果を取得する関数
export async function getAnalysisResults(options?: {
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filter?: "all" | "safe" | "unsafe"
}) {
  try {
    const { limit = 100, sortBy = "created_at", sortOrder = "desc", filter = "all" } = options || {}

    // 実際のSupabase接続がない場合はモックデータを返す
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Using mock data for getAnalysisResults")

      // モックデータをフィルタリング
      let filteredResults = [...mockAnalysisResults]

      if (filter === "safe") {
        filteredResults = filteredResults.filter((item) => item.analysisResult.isSafe)
      } else if (filter === "unsafe") {
        filteredResults = filteredResults.filter((item) => !item.analysisResult.isSafe)
      }

      // モックデータをソート
      filteredResults.sort((a, b) => {
        if (sortBy === "created_at" || sortBy === "timestamp") {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA
        } else if (sortBy === "safety_score") {
          const scoreA = a.analysisResult.safetyScore
          const scoreB = b.analysisResult.safetyScore
          return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA
        }
        return 0
      })

      // 件数制限
      return filteredResults.slice(0, limit)
    }

    let query = supabaseAdmin.from("analysis_results").select("*")

    // フィルタリング
    if (filter === "safe") {
      query = query.eq("is_safe", true)
    } else if (filter === "unsafe") {
      query = query.eq("is_safe", false)
    }

    // ソート
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // 件数制限
    query = query.limit(limit)

    const { data, error } = await query

    if (error) throw error

    // APIの形式に合わせてデータを変換
    return data.map((item) => ({
      id: item.id,
      timestamp: item.created_at,
      jobDescription: item.job_description,
      analysisResult: {
        isSafe: item.is_safe,
        safetyScore: item.safety_score,
        warningFlags: item.warning_flags || [],
        reasonsForConcern: item.reasons_for_concern || [],
        legalIssues: item.legal_issues || [],
        redFlags: item.red_flags,
        safetyAnalysis: item.safety_analysis,
        recommendedActions: item.recommended_actions || [],
        alternativeJobSuggestions: item.alternative_job_suggestions || [],
        confidenceLevel: item.confidence_level,
      },
      filename: item.id, // filenameの代わりにidを使用
    })) as AnalysisResult[]
  } catch (error) {
    console.error("Error fetching analysis results from Supabase:", error)
    // エラー時はモックデータを返す
    return mockAnalysisResults
  }
}

// 統計情報を取得する関数
export async function getAnalyticsData() {
  try {
    // 実際のSupabase接続がない場合はモックデータを返す
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Using mock data for getAnalyticsData")

      // モックデータから統計情報を生成
      const safeCount = mockAnalysisResults.filter((item) => item.analysisResult.isSafe).length
      const unsafeCount = mockAnalysisResults.filter((item) => !item.analysisResult.isSafe).length
      const totalCount = mockAnalysisResults.length

      // スコア分布の計算
      const scoreDistribution = [
        {
          score_range: "0-20%",
          count: mockAnalysisResults.filter((item) => item.analysisResult.safetyScore <= 20).length,
        },
        {
          score_range: "21-40%",
          count: mockAnalysisResults.filter(
            (item) => item.analysisResult.safetyScore > 20 && item.analysisResult.safetyScore <= 40,
          ).length,
        },
        {
          score_range: "41-60%",
          count: mockAnalysisResults.filter(
            (item) => item.analysisResult.safetyScore > 40 && item.analysisResult.safetyScore <= 60,
          ).length,
        },
        {
          score_range: "61-80%",
          count: mockAnalysisResults.filter(
            (item) => item.analysisResult.safetyScore > 60 && item.analysisResult.safetyScore <= 80,
          ).length,
        },
        {
          score_range: "81-100%",
          count: mockAnalysisResults.filter((item) => item.analysisResult.safetyScore > 80).length,
        },
      ]

      // 危険シグナルの出現頻度
      const redFlagsFrequency = [
        {
          flag_type: "unrealisticPay",
          count: mockAnalysisResults.filter((item) => item.analysisResult.redFlags.unrealisticPay).length,
        },
        {
          flag_type: "lackOfCompanyInfo",
          count: mockAnalysisResults.filter((item) => item.analysisResult.redFlags.lackOfCompanyInfo).length,
        },
        {
          flag_type: "requestForPersonalInfo",
          count: mockAnalysisResults.filter((item) => item.analysisResult.redFlags.requestForPersonalInfo).length,
        },
        {
          flag_type: "unclearJobDescription",
          count: mockAnalysisResults.filter((item) => item.analysisResult.redFlags.unclearJobDescription).length,
        },
        {
          flag_type: "illegalActivity",
          count: mockAnalysisResults.filter((item) => item.analysisResult.redFlags.illegalActivity).length,
        },
      ]

      // 月別分析件数（モックデータ用に簡易的に生成）
      const monthlyAnalysis = [
        { month: "2025-01-01T00:00:00Z", count: 5 },
        { month: "2025-02-01T00:00:00Z", count: 8 },
        { month: "2025-03-01T00:00:00Z", count: 12 },
      ]

      return {
        scoreDistribution,
        redFlagsFrequency,
        monthlyAnalysis,
        riskDistribution: {
          safe_count: safeCount,
          warning_count: Math.floor(unsafeCount / 2),
          dangerous_count: Math.ceil(unsafeCount / 2),
        },
      }
    }

    // 安全性スコア分布
    const { data: scoreDistribution, error: scoreError } = await supabaseAdmin
      .from("analysis_score_distribution")
      .select("*")

    if (scoreError) throw scoreError

    // 危険シグナルの出現頻度
    const { data: redFlagsFrequency, error: flagsError } = await supabaseAdmin.from("red_flags_frequency").select("*")

    if (flagsError) throw flagsError

    // 月別分析件数
    const { data: monthlyAnalysis, error: monthlyError } = await supabaseAdmin
      .from("analysis_monthly_counts")
      .select("*")

    if (monthlyError) throw monthlyError

    // 危険度別の分布
    const { data: riskDistribution, error: riskError } = await supabaseAdmin.from("risk_distribution").select("*")

    if (riskError) throw riskError

    return {
      scoreDistribution,
      redFlagsFrequency,
      monthlyAnalysis,
      riskDistribution: riskDistribution[0], // 単一行のみ返される
    }
  } catch (error) {
    console.error("Error fetching analytics data from Supabase:", error)

    // エラー時はモックデータを返す
    const safeCount = mockAnalysisResults.filter((item) => item.analysisResult.isSafe).length
    const unsafeCount = mockAnalysisResults.filter((item) => !item.analysisResult.isSafe).length

    return {
      scoreDistribution: [
        { score_range: "0-20%", count: 1 },
        { score_range: "21-40%", count: 1 },
        { score_range: "41-60%", count: 0 },
        { score_range: "61-80%", count: 0 },
        { score_range: "81-100%", count: 1 },
      ],
      redFlagsFrequency: [
        { flag_type: "unrealisticPay", count: 2 },
        { flag_type: "lackOfCompanyInfo", count: 2 },
        { flag_type: "requestForPersonalInfo", count: 1 },
        { flag_type: "unclearJobDescription", count: 2 },
        { flag_type: "illegalActivity", count: 1 },
      ],
      monthlyAnalysis: [
        { month: "2025-01-01T00:00:00Z", count: 5 },
        { month: "2025-02-01T00:00:00Z", count: 8 },
        { month: "2025-03-01T00:00:00Z", count: 12 },
      ],
      riskDistribution: {
        safe_count: safeCount,
        warning_count: Math.floor(unsafeCount / 2),
        dangerous_count: Math.ceil(unsafeCount / 2),
      },
    }
  }
}

