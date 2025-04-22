"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyzerTab } from "@/components/analyzer-tab"
import { ImageAnalyzerTab } from "@/components/image-analyzer-tab"
import { HistoryTab } from "@/components/history-tab"
import { StatisticsTab } from "@/components/statistics-tab"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"

export function JobAnalyzer() {
  const [error, setError] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [activeTab, setActiveTab] = useState("analyzer")
  const [isLoading, setIsLoading] = useState(false)

  // コンポーネントマウント時に履歴データを取得
  useEffect(() => {
    fetchAnalyses()
  }, [])

  // タブ切り替え時に履歴データを再取得
  useEffect(() => {
    if (activeTab === "history" || activeTab === "statistics") {
      fetchAnalyses()
    }
  }, [activeTab])

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/analyses")
      if (!response.ok) {
        throw new Error("過去の分析結果の取得に失敗しました")
      }

      const data = await response.json()
      setAnalyses(data)
      return data
    } catch (error) {
      console.error("履歴データ取得エラー:", error)
      setError("過去の分析結果の取得に失敗しました")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="analyzer" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">テキスト分析</TabsTrigger>
          <TabsTrigger value="image-analyzer">画像分析</TabsTrigger>
          <TabsTrigger value="history">分析履歴</TabsTrigger>
          <TabsTrigger value="statistics">統計情報</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <AnalyzerTab setError={setError} onAnalysisComplete={fetchAnalyses} />
        </TabsContent>

        <TabsContent value="image-analyzer">
          <ImageAnalyzerTab setError={setError} onAnalysisComplete={fetchAnalyses} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab analyses={analyses} fetchAnalyses={fetchAnalyses} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsTab analyses={analyses} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
