"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { AnalysisResult } from "@/types/analysis"
import { Chart, registerables } from "chart.js"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

Chart.register(...registerables)

interface StatisticsTabProps {
  analyses: AnalysisResult[]
}

export function StatisticsTab({ analyses }: StatisticsTabProps) {
  const safetyDistributionChartRef = useRef<HTMLCanvasElement>(null)
  const redFlagsFrequencyChartRef = useRef<HTMLCanvasElement>(null)
  const monthlyAnalysisChartRef = useRef<HTMLCanvasElement>(null)
  const riskDistributionChartRef = useRef<HTMLCanvasElement>(null)

  const charts = useRef<{ [key: string]: Chart | null }>({
    safetyDistribution: null,
    redFlagsFrequency: null,
    monthlyAnalysis: null,
    riskDistribution: null,
  })

  useEffect(() => {
    if (analyses.length > 0) {
      updateCharts()
    }

    return () => {
      // クリーンアップ
      Object.values(charts.current).forEach((chart) => chart?.destroy())
    }
  }, [analyses])

  const updateCharts = () => {
    updateSafetyDistributionChart()
    updateRedFlagsFrequencyChart()
    updateMonthlyAnalysisChart()
    updateRiskDistributionChart()
  }

  const updateSafetyDistributionChart = () => {
    if (safetyDistributionChartRef.current) {
      if (charts.current.safetyDistribution) charts.current.safetyDistribution.destroy()

      const ctx = safetyDistributionChartRef.current.getContext("2d")
      if (ctx) {
        const distribution = calculateScoreDistribution()

        charts.current.safetyDistribution = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"],
            datasets: [
              {
                label: "安全性スコア分布",
                data: distribution,
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
    if (redFlagsFrequencyChartRef.current) {
      if (charts.current.redFlagsFrequency) charts.current.redFlagsFrequency.destroy()

      const ctx = redFlagsFrequencyChartRef.current.getContext("2d")
      if (ctx) {
        const flagCounts = calculateRedFlagFrequency()
        const labels = Object.keys(flagCounts).map(formatFlagKey)
        const values = Object.values(flagCounts)

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
    if (monthlyAnalysisChartRef.current) {
      if (charts.current.monthlyAnalysis) charts.current.monthlyAnalysis.destroy()

      const ctx = monthlyAnalysisChartRef.current.getContext("2d")
      if (ctx) {
        const monthlyData = calculateMonthlyAnalysis()

        charts.current.monthlyAnalysis = new Chart(ctx, {
          type: "line",
          data: {
            labels: monthlyData.labels,
            datasets: [
              {
                label: "分析件数",
                data: monthlyData.counts,
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
    if (riskDistributionChartRef.current) {
      if (charts.current.riskDistribution) charts.current.riskDistribution.destroy()

      const ctx = riskDistributionChartRef.current.getContext("2d")
      if (ctx) {
        const riskData = calculateRiskDistribution()

        charts.current.riskDistribution = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["安全", "要注意", "危険"],
            datasets: [
              {
                data: [riskData.safe, riskData.warning, riskData.dangerous],
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

  // スコア分布の計算
  const calculateScoreDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    analyses.forEach((item) => {
      const score = item.analysisResult.safetyScore
      const index = Math.min(Math.floor(score / 20), 4)
      distribution[index]++
    })
    return distribution
  }

  // 危険フラグ頻度の計算
  const calculateRedFlagFrequency = () => {
    const counts: { [key: string]: number } = {
      unrealisticPay: 0,
      lackOfCompanyInfo: 0,
      requestForPersonalInfo: 0,
      unclearJobDescription: 0,
      illegalActivity: 0,
    }

    analyses.forEach((item) => {
      const flags = item.analysisResult.redFlags
      for (const flag in flags) {
        if (flags[flag as keyof typeof flags]) {
          counts[flag]++
        }
      }
    })

    return counts
  }

  // 月別分析データの計算
  const calculateMonthlyAnalysis = () => {
    const months: { [key: string]: number } = {}
    analyses.forEach((item) => {
      const date = new Date(item.timestamp)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      months[key] = (months[key] || 0) + 1
    })

    const sortedMonths = Object.keys(months).sort()
    return {
      labels: sortedMonths.map((m) => {
        const [year, month] = m.split("-")
        return `${year}年${month}月`
      }),
      counts: sortedMonths.map((month) => months[month]),
    }
  }

  // リスク分布の計算
  const calculateRiskDistribution = () => {
    return analyses.reduce(
      (acc: { safe: number; warning: number; dangerous: number }, item) => {
        const score = item.analysisResult.safetyScore
        if (score >= 80) acc.safe++
        else if (score >= 40) acc.warning++
        else acc.dangerous++
        return acc
      },
      { safe: 0, warning: 0, dangerous: 0 },
    )
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">統計情報</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-1" />
                <span>分析データ: {analyses.length}件</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>これまでに分析された求人の統計情報です</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {analyses.length > 0 ? (
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

