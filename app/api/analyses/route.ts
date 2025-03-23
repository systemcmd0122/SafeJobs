import { readdir, readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import type { AnalysisResult } from "@/types/analysis"

// ログディレクトリの設定
const LOG_DIR = path.join(process.cwd(), "logs")

export async function GET() {
  try {
    try {
      const files = await readdir(LOG_DIR)

      const jsonFiles = files.filter((file) => file.endsWith(".json"))

      const analysesPromises = jsonFiles.map(async (file) => {
        const filePath = path.join(LOG_DIR, file)
        const content = await readFile(filePath, "utf8")
        const data = JSON.parse(content) as AnalysisResult
        return {
          ...data,
          filename: file,
        }
      })

      const analyses = await Promise.all(analysesPromises)

      // 日付順にソート（新しい順）
      analyses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return NextResponse.json(analyses)
    } catch (error) {
      // ディレクトリが存在しない場合は空の配列を返す
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return NextResponse.json([])
      }
      throw error
    }
  } catch (error) {
    console.error("Error fetching past analyses:", error)
    return NextResponse.json({ error: "過去の分析結果の取得に失敗しました" }, { status: 500 })
  }
}

