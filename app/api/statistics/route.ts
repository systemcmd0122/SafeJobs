import { NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/supabase"

export async function GET() {
  try {
    // Supabaseから統計情報を取得
    const analyticsData = await getAnalyticsData()

    // キャッシュを防止するためのヘッダーを設定
    return NextResponse.json(analyticsData, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "統計情報の取得に失敗しました" }, { status: 500 })
  }
}

