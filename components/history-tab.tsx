"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnalysisResult } from "@/types/analysis"
import { HistoryItem } from "@/components/history-item"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HistoryTabProps {
  analyses: AnalysisResult[]
  fetchAnalyses: () => Promise<AnalysisResult[]>
}

export function HistoryTab({ analyses: initialAnalyses, fetchAnalyses }: HistoryTabProps) {
  const [sortValue, setSortValue] = useState("created_at-desc")
  const [filterValue, setFilterValue] = useState("all")
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(initialAnalyses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [sortValue, filterValue])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)

      // ソート値を分解
      const [sortBy, sortOrder] = sortValue.split("-")

      // APIリクエストのURLを構築
      const url = `/api/analyses?sortBy=${sortBy}&sortOrder=${sortOrder}&filter=${filterValue}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("過去の分析結果の取得に失敗しました")
      }

      const data = await response.json()
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "過去の分析結果の取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">過去の分析結果</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">日付（新しい順）</SelectItem>
            <SelectItem value="created_at-asc">日付（古い順）</SelectItem>
            <SelectItem value="safety_score-desc">安全性スコア（高い順）</SelectItem>
            <SelectItem value="safety_score-asc">安全性スコア（低い順）</SelectItem>
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
        {loading ? (
          // ローディング中の表示
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-16 w-full mb-3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))
        ) : analyses.length > 0 ? (
          analyses.map((analysis, index) => <HistoryItem key={analysis.id || index} analysis={analysis} />)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">表示する分析結果がありません。</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

