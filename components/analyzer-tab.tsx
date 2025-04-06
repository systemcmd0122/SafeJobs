"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import type { AnalysisResult } from "@/types/analysis"
import { AnalysisResultDisplay } from "@/components/analysis-result-display"
import { AnalysisConsentModal } from "@/components/analysis-consent-modal"
import { Loader2 } from "lucide-react"
import { useAnalysisConsent } from "@/hooks/use-analysis-consent"

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
  const [showConsentModal, setShowConsentModal] = useState(false)

  // 解析結果保存の同意状態を管理するカスタムフック
  const { hasConsented, setConsent, shouldAskForConsent } = useAnalysisConsent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobDescription.trim()) {
      setError("求人内容を入力してください。")
      return
    }

    try {
      setIsAnalyzing(true)
      setError(null)

      // 解析を実行（保存はしない）
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          saveToHistory: false, // 初回は保存しない
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "分析に失敗しました")
      }

      const data = await response.json()

      // 解析結果を表示
      setResult(data)

      // 結果までスクロール
      setTimeout(() => {
        document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth" })
      }, 100)

      // 同意確認が必要かどうかを判断し、必要であれば同意モーダルを表示
      if (shouldAskForConsent()) {
        setShowConsentModal(true)
      }
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

  // 履歴に保存する処理
  const saveToHistory = async () => {
    if (!result) return

    try {
      // 履歴に保存するAPIリクエスト
      const saveResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: result.jobDescription,
          saveToHistory: true,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("履歴の保存に失敗しました")
      }

      const savedData = await saveResponse.json()

      // 保存済みの結果で更新
      setResult(savedData)

      // 履歴データを更新
      await onAnalysisComplete()
    } catch (error) {
      console.error("履歴保存エラー:", error)
      setError("履歴の保存に失敗しました。ただし、分析結果は表示されています。")
    }
  }

  // 同意モーダルでの選択を処理
  const handleConsentDecision = async (consent: boolean) => {
    // 同意状態を保存
    setConsent(consent)

    if (consent && result) {
      // 同意した場合は履歴に保存
      await saveToHistory()
    }

    // モーダルを閉じる
    setShowConsentModal(false)
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

      {/* 解析結果保存の同意モーダル */}
      <AnalysisConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        onConsent={handleConsentDecision}
      />
    </div>
  )
}

