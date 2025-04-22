"use client"

import type React from "react"

import { useState } from "react"
import { ImageUploader } from "@/components/image-uploader"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Edit, Copy } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"
import { AnalysisResultDisplay } from "@/components/analysis-result-display"
import { AnalysisConsentModal } from "@/components/analysis-consent-modal"
import { useAnalysisConsent } from "@/hooks/use-analysis-consent"
import { validateAnalysisResult } from "@/lib/analysis-utils"
import { useToast } from "@/hooks/use-toast"

interface ImageAnalyzerTabProps {
  setError: (error: string | null) => void
  onAnalysisComplete: () => Promise<AnalysisResult[]>
}

export function ImageAnalyzerTab({ setError, onAnalysisComplete }: ImageAnalyzerTabProps) {
  const [extractedText, setExtractedText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 解析結果保存の同意状態を管理するカスタムフック
  const { hasConsented, setConsent, shouldAskForConsent } = useAnalysisConsent()

  const handleExtractedText = (text: string) => {
    setExtractedText(text)
    setResult(null) // 新しいテキストが抽出されたら結果をリセット

    // 編集モードを自動的に有効にして、ユーザーがテキストを確認・編集できるようにする
    setIsEditing(true)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedText(e.target.value)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      toast({
        title: "コピーしました",
        description: "テキストがクリップボードにコピーされました",
        duration: 2000,
      })
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました:", err)
      toast({
        title: "コピーに失敗しました",
        description: "テキストのコピーに失敗しました。別の方法でお試しください。",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleAnalyze = async () => {
    if (!extractedText.trim()) {
      setError("テキストが空です。画像からテキストを抽出するか、テキストを入力してください。")
      return
    }

    try {
      setIsAnalyzing(true)
      setError(null)
      setResult(null) // 新しい解析を開始する前に結果をクリア

      // 解析を実行（保存はしない）
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: extractedText,
          saveToHistory: false, // 初回は保存しない
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "分析に失敗しました")
      }

      const data = await response.json()

      // データの検証
      if (!validateAnalysisResult(data)) {
        throw new Error("解析結果のデータ形式が不正です")
      }

      // 解析結果を表示
      setResult(data)

      // 結果までスクロール
      setTimeout(() => {
        const element = document.getElementById("image-analysis-result")
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)

      // 同意確認が必要かどうかを判断し、必要であれば同意モーダルを表示
      if (shouldAskForConsent()) {
        // 少し遅延させてモーダルを表示（UIの安定性向上のため）
        setTimeout(() => {
          setShowConsentModal(true)
        }, 500)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`分析中にエラーが発生しました: ${error.message}`)
      } else {
        setError("分析中に不明なエラーが発生しました")
      }
      console.error("解析エラー:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 履歴に保存する処理
  const saveToHistory = async () => {
    if (!result) return

    try {
      setIsSaving(true)
      setError(null)

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

      // データの検証
      if (!validateAnalysisResult(savedData)) {
        throw new Error("保存された解析結果のデータ形式が不正です")
      }

      // 保存済みの結果で更新
      setResult(savedData)

      // 履歴データを更新
      await onAnalysisComplete()

      toast({
        title: "保存しました",
        description: "分析結果が履歴に保存されました",
        duration: 3000,
      })
    } catch (error) {
      console.error("履歴保存エラー:", error)
      setError("履歴の保存に失敗しました。ただし、分析結果は表示されています。")
    } finally {
      setIsSaving(false)
    }
  }

  // 同意モーダルでの選択を処理
  const handleConsentDecision = async (consent: boolean) => {
    // 同意状態を保存
    setConsent(consent)

    // モーダルを閉じる
    setShowConsentModal(false)

    if (consent && result) {
      // 同意した場合は履歴に保存
      await saveToHistory()
    }
  }

  return (
    <div className="space-y-8">
      <ImageUploader onExtractedText={handleExtractedText} />

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">抽出されたテキスト</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-1"
                disabled={!extractedText.trim()}
              >
                <Copy className="h-4 w-4" />
                コピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                {isEditing ? "編集を完了" : "テキストを編集"}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <Textarea
              value={extractedText}
              onChange={handleTextChange}
              placeholder="テキストを編集できます..."
              className="min-h-[150px] mb-4"
            />
          ) : (
            <div className="bg-muted p-4 rounded-md mb-4 min-h-[100px] max-h-[300px] overflow-y-auto">
              {extractedText ? (
                <p className="whitespace-pre-wrap">{extractedText}</p>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  画像からテキストを抽出するか、テキストを直接編集してください
                </p>
              )}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={isAnalyzing || !extractedText.trim()} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              "テキストを分析"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div id="image-analysis-result">
          <h2 className="text-xl font-semibold mb-4">分析結果</h2>
          <Card>
            <CardContent className="p-0">
              <AnalysisResultDisplay
                result={result}
                isSaving={isSaving}
                onSaveRequest={hasConsented === true ? saveToHistory : undefined}
              />
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
