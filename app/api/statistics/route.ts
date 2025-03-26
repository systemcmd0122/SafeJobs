import { NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/supabase"

export async function GET() {
  try {
    // Supabaseから統計情報を取得
    const analyticsData = await getAnalyticsData()

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "統計情報の取得に失敗しました" }, { status: 500 })
  }
}

