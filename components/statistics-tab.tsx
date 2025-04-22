"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { AnalysisResult } from "@/types/analysis"
import { Chart, registerables } from "chart.js"
import { Info, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

Chart.register(...registerables)

interface StatisticsTabProps {
  analyses: AnalysisResult[]
  isLoading: boolean
}

export function StatisticsTab({ analyses, isLoading: parentLoading }: StatisticsTabProps) {
  const safetyDistributionChartRef = useRef<HTMLCanvasElement>(null)
  const redFlagsFrequencyChartRef = useRef<HTMLCanvasElement>(null)
  const monthlyAnalysisChartRef = useRef<HTMLCanvasElement>(null)
  const riskDistributionChartRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  const charts = useRef<{ [key: string]: Chart | null }>({
    safetyDistribution: null,
    redFlagsFrequency: null,
    monthlyAnalysis: null,
    riskDistribution: null,
  })

  // コンポーネントがマウントされたときに表示状態を更新
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  // コンポーネントが表示されたときにデータを取得
  useEffect(() => {
    if (isVisible) {
      fetchStatistics()
    }
  }, [isVisible])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/statistics")
      if (!response.ok) {
        throw new Error("統計情報の取得に失敗しました")
      }

      const data = await response.json()
      setStatsData(data)
    } catch (err) {
      console.error("統計データ取得エラー:", err)
      setError(err instanceof Error ? err.message : "統計情報の取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (statsData && !loading) {
      updateCharts()
    }

    return () => {
      // クリーンアップ
      Object.values(charts.current).forEach((chart) => chart?.destroy())
    }
  }, [statsData, loading])

  const updateCharts = () => {
    updateSafetyDistributionChart()
    updateRedFlagsFrequencyChart()
    updateMonthlyAnalysisChart()
    updateRiskDistributionChart()
  }

  const updateSafetyDistributionChart = () => {
    if (safetyDistributionChartRef.current && statsData?.scoreDistribution) {
      if (charts.current.safetyDistribution) charts.current.safetyDistribution.destroy()

      const ctx = safetyDistributionChartRef.current.getContext("2d")
      if (ctx) {
        const distribution = statsData.scoreDistribution

        charts.current.safetyDistribution = new Chart(ctx, {
          type: "bar",
          data: {
            labels: distribution.map((item: any) => item.score_range),
            datasets: [
              {
                label: "安全性スコア分布",
                data: distribution.map((item: any) => item.count),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.7)",
                  "rgba(255, 159, 64, 0.7)",
                  "rgba(255, 205, 86, 0.7)",
                  "rgba(75, 192, 192, 0.7)",
                  "rgba(54, 162, 235, 0.7)",
                ],
                borderColor: [
                  "rgb(255, 99, 132)",
                  "rgb(255, 159, 64)",
                  "rgb(255, 205, 86)",
                  "rgb(75, 192, 192)",
                  "rgb(54, 162, 235)",
                ],
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  font: {
                    size: 11,
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `件数: ${context.raw}件`,
                },
              },
            },
          },
        })
      }
    }
  }

  const updateRedFlagsFrequencyChart = () => {
    if (redFlagsFrequencyChartRef.current && statsData?.redFlagsFrequency) {
      if (charts.current.redFlagsFrequency) charts.current.redFlagsFrequency.destroy()

      const ctx = redFlagsFrequencyChartRef.current.getContext("2d")
      if (ctx) {
        const flagData = statsData.redFlagsFrequency
        const labels = flagData.map((item: any) => formatFlagKey(item.flag_type))
        const values = flagData.map((item: any) => item.count)

        charts.current.redFlagsFrequency = new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.7)",
                  "rgba(54, 162, 235, 0.7)",
                  "rgba(255, 206, 86, 0.7)",
                  "rgba(75, 192, 192, 0.7)",
                  "rgba(153, 102, 255, 0.7)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  font: {
                    size: 11,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                    const percentage = Math.round((value / total) * 100)
                    return `${context.label}: ${value}件 (${percentage}%)`
                  },
                },
              },
            },
          },
        })
      }
    }
  }

  const updateMonthlyAnalysisChart = () => {
    if (monthlyAnalysisChartRef.current && statsData?.monthlyAnalysis) {
      if (charts.current.monthlyAnalysis) charts.current.monthlyAnalysis.destroy()

      const ctx = monthlyAnalysisChartRef.current.getContext("2d")
      if (ctx) {
        const monthlyData = statsData.monthlyAnalysis

        // 日付をフォーマット
        const labels = monthlyData.map((item: any) => {
          const date = new Date(item.month)
          return `${date.getFullYear()}年${date.getMonth() + 1}月`
        })

        const counts = monthlyData.map((item: any) => item.count)

        charts.current.monthlyAnalysis = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "分析件数",
                data: counts,
                fill: {
                  target: "origin",
                  above: "rgba(75, 192, 192, 0.2)",
                },
                borderColor: "rgb(75, 192, 192)",
                tension: 0.3,
                pointBackgroundColor: "rgb(75, 192, 192)",
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  font: {
                    size: 11,
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `分析件数: ${context.raw}件`,
                },
              },
            },
          },
        })
      }
    }
  }

  const updateRiskDistributionChart = () => {
    if (riskDistributionChartRef.current && statsData?.riskDistribution) {
      if (charts.current.riskDistribution) charts.current.riskDistribution.destroy()

      const ctx = riskDistributionChartRef.current.getContext("2d")
      if (ctx) {
        const riskData = statsData.riskDistribution

        charts.current.riskDistribution = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["安全", "要注意", "危険"],
            datasets: [
              {
                data: [riskData.safe_count, riskData.warning_count, riskData.dangerous_count],
                backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 206, 86, 0.7)", "rgba(255, 99, 132, 0.7)"],
                borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number
                    const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
                    const percentage = Math.round((value / total) * 100)
                    return `${context.label}: ${value}件 (${percentage}%)`
                  },
                },
              },
            },
          },
        })
      }
    }
  }

  const formatFlagKey = (key: string) => {
    const translations: { [key: string]: string } = {
      unrealisticPay: "非現実的な高額報酬",
      lackOfCompanyInfo: "会社情報の欠如",
      requestForPersonalInfo: "個人情報の不審な要求",
      unclearJobDescription: "曖昧な仕事内容",
      illegalActivity: "違法行為の示唆",
    }
    return translations[key] || key
  }

  const handleRefresh = async () => {
    await fetchStatistics()
  }

  const isLoadingData = loading || parentLoading

  const totalAnalyses = statsData?.riskDistribution
    ? statsData.riskDistribution.safe_count +
      statsData.riskDistribution.warning_count +
      statsData.riskDistribution.dangerous_count
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">統計情報</h2>
        <div className="flex items-center gap-4">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  <span>分析データ: {isLoadingData ? "読み込み中..." : `${totalAnalyses}件`}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>これまでに分析された求人の統計情報です</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="p-6 text-center text-red-600">{error}</CardContent>
        </Card>
      )}

      {isLoadingData ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsData && totalAnalyses > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">全体の安全性分布</h3>
              <div className="h-[300px]">
                <canvas ref={safetyDistributionChartRef}></canvas>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-3">
                安全性スコアの分布状況（スコア範囲別の件数）
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">危険シグナルの出現頻度</h3>
              <div className="h-[300px]">
                <canvas ref={redFlagsFrequencyChartRef}></canvas>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-3">各危険シグナルが検出された割合</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">月別分析件数推移</h3>
              <div className="h-[300px]">
                <canvas ref={monthlyAnalysisChartRef}></canvas>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-3">月ごとの分析件数の推移</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">危険度別の分布</h3>
              <div className="h-[300px]">
                <canvas ref={riskDistributionChartRef}></canvas>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-3">安全・要注意・危険の割合</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            統計情報を表示するには分析データが必要です。
          </CardContent>
        </Card>
      )}
    </div>
  )
}
