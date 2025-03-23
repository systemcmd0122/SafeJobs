"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnalysisResult } from "@/types/analysis"
import { HistoryItem } from "@/components/history-item"

interface HistoryTabProps {
  analyses: AnalysisResult[]
  fetchAnalyses: () => Promise<AnalysisResult[]>
}

export function HistoryTab({ analyses, fetchAnalyses }: HistoryTabProps) {
  const [sortValue, setSortValue] = useState("date-desc")
  const [filterValue, setFilterValue] = useState("all")
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisResult[]>([])

  useEffect(() => {
    fetchAnalyses()
  }, [])

  useEffect(() => {
    if (analyses.length > 0) {
      applyFiltersAndSort()
    }
  }, [analyses, sortValue, filterValue])

  const applyFiltersAndSort = () => {
    let filtered = [...analyses]

    // フィルタリング
    if (filterValue !== "all") {
      filtered = analyses.filter((analysis) => {
        const isSafe = analysis.analysisResult.isSafe
        return filterValue === "safe" ? isSafe : !isSafe
      })
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortValue) {
        case "date-desc":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "date-asc":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "score-desc":
          return b.analysisResult.safetyScore - a.analysisResult.safetyScore
        case "score-asc":
          return a.analysisResult.safetyScore - b.analysisResult.safetyScore
        default:
          return 0
      }
    })

    setFilteredAnalyses(filtered)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">過去の分析結果</h2>

      <div className="flex gap-4 mb-6">
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">日付（新しい順）</SelectItem>
            <SelectItem value="date-asc">日付（古い順）</SelectItem>
            <SelectItem value="score-desc">安全性スコア（高い順）</SelectItem>
            <SelectItem value="score-asc">安全性スコア（低い順）</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="フィルター" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="safe">安全な求人のみ</SelectItem>
            <SelectItem value="unsafe">危険な求人のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAnalyses.length > 0 ? (
          filteredAnalyses.map((analysis, index) => <HistoryItem key={index} analysis={analysis} />)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">表示する分析結果がありません。</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

