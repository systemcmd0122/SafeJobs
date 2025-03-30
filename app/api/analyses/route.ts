import { NextResponse } from "next/server"
import { getAnalysisResults } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // URLからクエリパラメータを取得
    const url = new URL(request.url)
    const sortBy = url.searchParams.get("sortBy") || "created_at"
    const sortOrder = (url.searchParams.get("sortOrder") as "asc" | "desc") || "desc"
    const filter = (url.searchParams.get("filter") as "all" | "safe" | "unsafe") || "all"
    const limit = Number.parseInt(url.searchParams.get("limit") || "100", 10)

    // キャッシュを無効化するためのタイムスタンプパラメータを無視
    // (クライアント側でキャッシュバスティングのために使用される可能性がある)

    // Supabaseから分析結果を取得
    const analyses = await getAnalysisResults({
      sortBy,
      sortOrder,
      filter,
      limit,
    })

    // キャッシュを防止するためのヘッダーを設定
    return NextResponse.json(analyses, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching past analyses:", error)
    return NextResponse.json({ error: "過去の分析結果の取得に失敗しました" }, { status: 500 })
  }
}

