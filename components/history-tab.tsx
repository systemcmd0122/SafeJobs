"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnalysisResult } from "@/types/analysis"
import { HistoryItem } from "@/components/history-item"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface HistoryTabProps {
  analyses: AnalysisResult[]
  fetchAnalyses: () => Promise<AnalysisResult[]>
  isLoading: boolean
}

export function HistoryTab({ analyses: initialAnalyses, fetchAnalyses, isLoading: parentLoading }: HistoryTabProps) {
  const [sortValue, setSortValue] = useState("created_at-desc")
  const [filterValue, setFilterValue] = useState("all")
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(initialAnalyses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // コンポーネントがマウントされたときに表示状態を更新
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  // 親コンポーネントから渡されたデータが更新されたときに状態を更新
  useEffect(() => {
    if (initialAnalyses && initialAnalyses.length > 0) {
      setAnalyses(initialAnalyses)
    }
  }, [initialAnalyses])

  // コンポーネントが表示されたときにデータを取得
  useEffect(() => {
    if (isVisible) {
      loadAnalyses()
    }
  }, [isVisible, sortValue, filterValue])

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
      console.error("履歴データ取得エラー:", err)
      setError(err instanceof Error ? err.message : "過去の分析結果の取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadAnalyses()
  }

  const isLoadingData = loading || parentLoading

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">過去の分析結果</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoadingData}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

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
        {isLoadingData ? (
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

