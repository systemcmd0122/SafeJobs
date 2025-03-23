"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyzerTab } from "@/components/analyzer-tab"
import { HistoryTab } from "@/components/history-tab"
import { StatisticsTab } from "@/components/statistics-tab"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"

export function JobAnalyzer() {
  const [error, setError] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch("/api/analyses")
      if (!response.ok) throw new Error("過去の分析結果の取得に失敗しました")
      const data = await response.json()
      setAnalyses(data)
      return data
    } catch (error) {
      setError("過去の分析結果の取得に失敗しました")
      return []
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="analyzer">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">求人分析</TabsTrigger>
          <TabsTrigger value="history">過去の分析結果</TabsTrigger>
          <TabsTrigger value="statistics">統計情報</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <AnalyzerTab setError={setError} onAnalysisComplete={fetchAnalyses} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab analyses={analyses} fetchAnalyses={fetchAnalyses} />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsTab analyses={analyses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

