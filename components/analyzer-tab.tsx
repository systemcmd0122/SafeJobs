"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import type { AnalysisResult } from "@/types/analysis"
import { AnalysisResultDisplay } from "@/components/analysis-result-display"
import { Loader2 } from "lucide-react"

// サンプル求人データ
const SAMPLE_JOBS = {
  safe: "都内オフィスでの一般事務のアルバイトです。時給1,200円、交通費支給。勤務時間は平日10時〜17時。書類整理やデータ入力が主な業務です。社会保険完備、研修制度あり。正社員登用制度もあります。",
  suspicious:
    "簡単作業で日給3万円保証！ノルマなし、即日払いOK。身分証のみで即採用。内容は当日説明します。LINE登録で詳細をお伝えします。学生・フリーター大歓迎！シフト自由！",
  dangerous:
    "夜のお客様と会話するだけの簡単なお仕事。時給5000円以上可能。容姿に自信のある方優遇。身バレ防止対策あり。ノンアダルト・ノンタッチ。即日勤務可能。出勤自由。",
}

interface AnalyzerTabProps {
  setError: (error: string | null) => void
  onAnalysisComplete: () => Promise<AnalysisResult[]>
}

export function AnalyzerTab({ setError, onAnalysisComplete }: AnalyzerTabProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobDescription.trim()) {
      setError("求人内容を入力してください。")
      return
    }

    try {
      setIsAnalyzing(true)
      setError(null)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "分析に失敗しました")
      }

      const data = await response.json()
      setResult(data)

      // 分析結果を取得
      await onAnalysisComplete()

      // 結果までスクロール
      setTimeout(() => {
        document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      if (error instanceof Error) {
        setError(`分析中にエラーが発生しました: ${error.message}`)
      } else {
        setError("分析中に不明なエラーが発生しました")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSampleJob = (sampleType: keyof typeof SAMPLE_JOBS) => {
    setJobDescription(SAMPLE_JOBS[sampleType])
  }

  const clearForm = () => {
    setJobDescription("")
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">求人内容を入力</h2>
          <form onSubmit={handleSubmit}>
            <Textarea
              id="job-description"
              placeholder="求人内容を入力してください..."
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mb-4 resize-y min-h-[150px]"
              required
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isAnalyzing} className="flex-shrink-0">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  "分析開始"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={clearForm} className="flex-shrink-0">
                クリア
              </Button>

              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => loadSampleJob("safe")}
                  className="text-xs"
                >
                  安全な一般事務
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => loadSampleJob("suspicious")}
                  className="text-xs"
                >
                  怪しい高額バイト
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => loadSampleJob("dangerous")}
                  className="text-xs"
                >
                  闇営業系
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">サンプル求人について</h3>
            <p className="text-xs text-muted-foreground">
              サンプルボタンをクリックすると、分析用のサンプル求人文が入力されます。
              「安全な一般事務」は正規のアルバイト、「怪しい高額バイト」は注意が必要な求人、「闇営業系」は危険性の高い求人の例です。
            </p>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div id="analysis-result">
          <h2 className="text-xl font-semibold mb-4">分析結果</h2>
          <Card>
            <CardContent className="p-0">
              <AnalysisResultDisplay result={result} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

