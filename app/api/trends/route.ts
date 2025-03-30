import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 過去12ヶ月のデータを生成
    const months = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toISOString().slice(0, 7))
    }

    // 月別分析件数
    const monthlyAnalysis = months.map((month) => ({
      month,
      count: Math.floor(Math.random() * 30) + 10,
      safeCount: Math.floor(Math.random() * 20) + 5,
      unsafeCount: Math.floor(Math.random() * 10) + 5,
    }))

    // 安全性スコアの推移
    const safetyScoreTrends = months.map((month) => ({
      month,
      averageScore: Math.floor(Math.random() * 30) + 50, // 50-80の範囲
    }))

    // 危険シグナルの推移
    const redFlagTypes = [
      "unrealisticPay",
      "lackOfCompanyInfo",
      "requestForPersonalInfo",
      "unclearJobDescription",
      "illegalActivity",
    ]

    const redFlagsTrends = redFlagTypes.map((type) => ({
      type,
      data: months.map((month) => ({
        month,
        count: Math.floor(Math.random() * 10) + 1,
      })),
    }))

    // 求人タイプ分布
    const jobTypes = [
      { type: "一般事務", count: 45, safePercentage: 85 },
      { type: "販売・接客", count: 35, safePercentage: 75 },
      { type: "IT・エンジニア", count: 25, safePercentage: 90 },
      { type: "配送・物流", count: 20, safePercentage: 70 },
      { type: "飲食", count: 15, safePercentage: 65 },
      { type: "その他", count: 10, safePercentage: 60 },
    ]

    return NextResponse.json({
      monthlyAnalysis,
      safetyScoreTrends,
      redFlagsTrends,
      jobTypes,
    })
  } catch (error) {
    console.error("Error generating trends data:", error)
    return NextResponse.json({ error: "トレンドデータの生成に失敗しました" }, { status: 500 })
  }
}

