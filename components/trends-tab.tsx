"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import { Info, TrendingUp, AlertTriangle, Calendar, BarChart3, PieChart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

Chart.register(...registerables)

type TrendsTabProps = {}

export function TrendsTab({}: TrendsTabProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendsData, setTrendsData] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("all")

  const monthlyTrendsChartRef = useRef<HTMLCanvasElement>(null)
  const safetyScoreTrendsChartRef = useRef<HTMLCanvasElement>(null)
  const redFlagsTrendsChartRef = useRef<HTMLCanvasElement>(null)
  const jobTypesChartRef = useRef<HTMLCanvasElement>(null)

  const charts = useRef<{ [key: string]: Chart | null }>({
    monthlyTrends: null,
    safetyScoreTrends: null,
    redFlagsTrends: null,
    jobTypes: null,
  })

  useEffect(() => {
    fetchTrendsData()
  }, [])

  const fetchTrendsData = async () => {
    try {
      setLoading(true)
      // 実際のAPIエンドポイントがある場合はそれを使用
      // const response = await fetch("/api/trends")
      // if (!response.ok) {
      //   throw new Error("トレンドデータの取得に失敗しました")
      // }
      // const data = await response.json()

      // モックデータを使用
      const data = generateMockTrendsData()
      setTrendsData(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "トレンドデータの取得中にエラーが発生しました")
      setLoading(false)
    }
  }

  const generateMockTrendsData = () => {
    // 過去12ヶ月のデータを生成
    const months = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toISOString().slice(0, 7))
    }

    // 月別分析件数
    const monthlyAnalysis = months.map((month) => ({
      month,
      count: Math.floor(Math.random() * 30) + 10,
      safeCount: Math.floor(Math.random() * 20) + 5,
      unsafeCount: Math.floor(Math.random() * 10) + 5,
    }))

    // 安全性スコアの推移
    const safetyScoreTrends = months.map((month) => ({
      month,
      averageScore: Math.floor(Math.random() * 30) + 50, // 50-80の範囲
    }))

    // 危険シグナルの推移
    const redFlagTypes = [
      "unrealisticPay",
      "lackOfCompanyInfo",
      "requestForPersonalInfo",
      "unclearJobDescription",
      "illegalActivity",
    ]

    const redFlagsTrends = redFlagTypes.map((type) => ({
      type,
      data: months.map((month) => ({
        month,
        count: Math.floor(Math.random() * 10) + 1,
      })),
    }))

    // 求人タイプ分布
    const jobTypes = [
      { type: "一般事務", count: 45, safePercentage: 85 },
      { type: "販売・接客", count: 35, safePercentage: 75 },
      { type: "IT・エンジニア", count: 25, safePercentage: 90 },
      { type: "配送・物流", count: 20, safePercentage: 70 },
      { type: "飲食", count: 15, safePercentage: 65 },
      { type: "その他", count: 10, safePercentage: 60 },
    ]

    return {
      monthlyAnalysis,
      safetyScoreTrends,
      redFlagsTrends,
      jobTypes,
    }
  }

  useEffect(() => {
    if (trendsData && !loading) {
      updateCharts()
    }

    return () => {
      // クリーンアップ
      Object.values(charts.current).forEach((chart) => chart?.destroy())
    }
  }, [trendsData, loading, timeRange])

  const updateCharts = () => {
    updateMonthlyTrendsChart()
    updateSafetyScoreTrendsChart()
    updateRedFlagsTrendsChart()
    updateJobTypesChart()
  }

  const filterDataByTimeRange = (data: any[]) => {
    if (timeRange === "all") return data

    const months = Number.parseInt(timeRange)
    return data.slice(-months)
  }

  const updateMonthlyTrendsChart = () => {
    if (monthlyTrendsChartRef.current && trendsData?.monthlyAnalysis) {
      if (charts.current.monthlyTrends) charts.current.monthlyTrends.destroy()

      const ctx = monthlyTrendsChartRef.current.getContext("2d")
      if (ctx) {
        const filteredData = filterDataByTimeRange(trendsData.monthlyAnalysis)

        const labels = filteredData.map((item: any) => {
          const date = new Date(item.month)
          return `${date.getFullYear()}年${date.getMonth() + 1}月`
        })

        charts.current.monthlyTrends = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "安全な求人",
                data: filteredData.map((item: any) => item.safeCount),
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: "危険な求人",
                data: filteredData.map((item: any) => item.unsafeCount),
                backgroundColor: "rgba(255, 99, 132, 0.7)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                stacked: true,
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
            },
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.raw}件`,
                },
              },
            },
          },
        })
      }
    }
  }

  const updateSafetyScoreTrendsChart = () => {
    if (safetyScoreTrendsChartRef.current && trendsData?.safetyScoreTrends) {
      if (charts.current.safetyScoreTrends) charts.current.safetyScoreTrends.destroy()

      const ctx = safetyScoreTrendsChartRef.current.getContext("2d")
      if (ctx) {
        const filteredData = filterDataByTimeRange(trendsData.safetyScoreTrends)

        const labels = filteredData.map((item: any) => {
          const date = new Date(item.month)
          return `${date.getFullYear()}年${date.getMonth() + 1}月`
        })

        charts.current.safetyScoreTrends = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "平均安全性スコア",
                data: filteredData.map((item: any) => item.averageScore),
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(54, 162, 235, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(54, 162, 235, 1)",
                pointRadius: 4,
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false,
                min: 0,
                max: 100,
                ticks: {
                  callback: (value) => value + "%",
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
                  label: (context) => `平均安全性スコア: ${context.raw}%`,
                },
              },
            },
          },
        })
      }
    }
  }

  const updateRedFlagsTrendsChart = () => {
    if (redFlagsTrendsChartRef.current && trendsData?.redFlagsTrends) {
      if (charts.current.redFlagsTrends) charts.current.redFlagsTrends.destroy()

      const ctx = redFlagsTrendsChartRef.current.getContext("2d")
      if (ctx) {
        const redFlagTypes = trendsData.redFlagsTrends.map((item: any) => formatFlagKey(item.type))

        // 最新月のデータを取得
        const latestMonthData = trendsData.redFlagsTrends.map((item: any) => {
          const filteredData = filterDataByTimeRange(item.data)
          return filteredData[filteredData.length - 1].count
        })

        charts.current.redFlagsTrends = new Chart(ctx, {
          type: "radar",
          data: {
            labels: redFlagTypes,
            datasets: [
              {
                label: "危険シグナル検出数",
                data: latestMonthData,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(255, 99, 132, 1)",
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                ticks: {
                  stepSize: 2,
                  font: {
                    size: 10,
                  },
                },
                pointLabels: {
                  font: {
                    size: 11,
                    weight: "bold",
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
                angleLines: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `検出数: ${context.raw}件`,
                },
              },
            },
          },
        })
      }
    }
  }

  const updateJobTypesChart = () => {
    if (jobTypesChartRef.current && trendsData?.jobTypes) {
      if (charts.current.jobTypes) charts.current.jobTypes.destroy()

      const ctx = jobTypesChartRef.current.getContext("2d")
      if (ctx) {
        const jobTypes = trendsData.jobTypes

        charts.current.jobTypes = new Chart(ctx, {
          type: "pie",
          data: {
            labels: jobTypes.map((item: any) => item.type),
            datasets: [
              {
                data: jobTypes.map((item: any) => item.count),
                backgroundColor: [
                  "rgba(54, 162, 235, 0.7)",
                  "rgba(75, 192, 192, 0.7)",
                  "rgba(153, 102, 255, 0.7)",
                  "rgba(255, 159, 64, 0.7)",
                  "rgba(255, 99, 132, 0.7)",
                  "rgba(201, 203, 207, 0.7)",
                ],
                borderColor: [
                  "rgba(54, 162, 235, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                  "rgba(255, 99, 132, 1)",
                  "rgba(201, 203, 207, 1)",
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
                    const jobType = jobTypes[context.dataIndex]
                    return [`${context.label}: ${value}件 (${percentage}%)`, `安全率: ${jobType.safePercentage}%`]
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">求人トレンド分析</h2>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">直近3ヶ月</SelectItem>
              <SelectItem value="6">直近6ヶ月</SelectItem>
              <SelectItem value="12">直近12ヶ月</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  <span>トレンド情報</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>求人市場の時間経過による変化を分析したデータです</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {loading ? (
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
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center text-red-600">{error}</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  月別分析件数推移
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <canvas ref={monthlyTrendsChartRef}></canvas>
                </div>
                <div className="text-xs text-center text-muted-foreground mt-3">
                  安全な求人と危険な求人の月別分析件数
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  安全性スコア推移
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <canvas ref={safetyScoreTrendsChartRef}></canvas>
                </div>
                <div className="text-xs text-center text-muted-foreground mt-3">
                  分析された求人の平均安全性スコアの推移
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  危険シグナル分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <canvas ref={redFlagsTrendsChartRef}></canvas>
                </div>
                <div className="text-xs text-center text-muted-foreground mt-3">各種危険シグナルの検出頻度分布</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  求人タイプ分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <canvas ref={jobTypesChartRef}></canvas>
                </div>
                <div className="text-xs text-center text-muted-foreground mt-3">分析された求人の職種別分布</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                トレンド分析レポート
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">概要</TabsTrigger>
                  <TabsTrigger value="safety">安全性分析</TabsTrigger>
                  <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm">
                      過去{timeRange === "all" ? "全期間" : timeRange + "ヶ月"}
                      のデータを分析した結果、求人市場では以下のトレンドが観測されています：
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <span className="font-medium">分析件数：</span> 月平均
                        {trendsData.monthlyAnalysis
                          .slice(-Number.parseInt(timeRange === "all" ? "12" : timeRange))
                          .reduce((acc: number, item: any) => acc + item.count, 0) /
                          (timeRange === "all" ? trendsData.monthlyAnalysis.length : Number.parseInt(timeRange))}
                        件の求人が分析されています。
                      </li>
                      <li>
                        <span className="font-medium">安全性スコア：</span> 平均安全性スコアは
                        {Math.round(
                          trendsData.safetyScoreTrends
                            .slice(-Number.parseInt(timeRange === "all" ? "12" : timeRange))
                            .reduce((acc: number, item: any) => acc + item.averageScore, 0) /
                            (timeRange === "all" ? trendsData.safetyScoreTrends.length : Number.parseInt(timeRange)),
                        )}
                        %で、
                        {(() => {
                          const recent = trendsData.safetyScoreTrends.slice(-3)
                          const older = trendsData.safetyScoreTrends.slice(-6, -3)
                          const recentAvg =
                            recent.reduce((acc: number, item: any) => acc + item.averageScore, 0) / recent.length
                          const olderAvg =
                            older.reduce((acc: number, item: any) => acc + item.averageScore, 0) / older.length
                          const diff = recentAvg - olderAvg
                          return diff > 0 ? "上昇傾向にあります" : diff < 0 ? "下降傾向にあります" : "安定しています"
                        })()}。
                      </li>
                      <li>
                        <span className="font-medium">危険シグナル：</span> 最も頻繁に検出される危険シグナルは
                        {(() => {
                          const counts = trendsData.redFlagsTrends.map((item: any) => {
                            const sum = item.data.reduce((acc: number, d: any) => acc + d.count, 0)
                            return { type: item.type, sum }
                          })
                          const maxType = counts.reduce(
                            (max: any, item: any) => (item.sum > max.sum ? item : max),
                            counts[0],
                          )
                          return formatFlagKey(maxType.type)
                        })()}
                        です。
                      </li>
                      <li>
                        <span className="font-medium">求人タイプ：</span> 最も多い求人タイプは
                        {
                          trendsData.jobTypes.reduce(
                            (max: any, item: any) => (item.count > max.count ? item : max),
                            trendsData.jobTypes[0],
                          ).type
                        }
                        で、全体の
                        {Math.round(
                          (trendsData.jobTypes.reduce(
                            (max: any, item: any) => (item.count > max.count ? item : max),
                            trendsData.jobTypes[0],
                          ).count /
                            trendsData.jobTypes.reduce((sum: number, item: any) => sum + item.count, 0)) *
                            100,
                        )}
                        %を占めています。
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="safety" className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm">安全性分析の結果、以下の特徴が観測されています：</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <span className="font-medium">安全な求人の割合：</span> 分析された求人のうち、約
                        {Math.round(
                          (trendsData.monthlyAnalysis.reduce((acc: number, item: any) => acc + item.safeCount, 0) /
                            trendsData.monthlyAnalysis.reduce((acc: number, item: any) => acc + item.count, 0)) *
                            100,
                        )}
                        %が安全と判断されています。
                      </li>
                      <li>
                        <span className="font-medium">危険シグナルの傾向：</span> 「{(() => {
                          const trends = trendsData.redFlagsTrends.map((item: any) => {
                            const recent = item.data.slice(-3)
                            const older = item.data.slice(-6, -3)
                            const recentAvg = recent.reduce((acc: number, d: any) => acc + d.count, 0) / recent.length
                            const olderAvg = older.reduce((acc: number, d: any) => acc + d.count, 0) / older.length
                            return { type: item.type, diff: recentAvg - olderAvg }
                          })
                          const maxIncrease = trends.reduce(
                            (max: any, item: any) => (item.diff > max.diff ? item : max),
                            trends[0],
                          )
                          return formatFlagKey(maxIncrease.type)
                        })()}
                        」の検出頻度が最も増加しています。
                      </li>
                      <li>
                        <span className="font-medium">安全性の高い職種：</span>
                        {
                          trendsData.jobTypes.reduce(
                            (max: any, item: any) => (item.safePercentage > max.safePercentage ? item : max),
                            trendsData.jobTypes[0],
                          ).type
                        }
                        が最も安全性が高く、安全率は
                        {
                          trendsData.jobTypes.reduce(
                            (max: any, item: any) => (item.safePercentage > max.safePercentage ? item : max),
                            trendsData.jobTypes[0],
                          ).safePercentage
                        }
                        %です。
                      </li>
                      <li>
                        <span className="font-medium">安全性の低い職種：</span>
                        {
                          trendsData.jobTypes.reduce(
                            (min: any, item: any) => (item.safePercentage < min.safePercentage ? item : min),
                            trendsData.jobTypes[0],
                          ).type
                        }
                        が最も安全性が低く、安全率は
                        {
                          trendsData.jobTypes.reduce(
                            (min: any, item: any) => (item.safePercentage < min.safePercentage ? item : min),
                            trendsData.jobTypes[0],
                          ).safePercentage
                        }
                        %です。
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="recommendations" className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm">トレンド分析に基づく推奨事項：</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <span className="font-medium">注意すべき求人タイプ：</span>
                        {
                          trendsData.jobTypes.reduce(
                            (min: any, item: any) => (item.safePercentage < min.safePercentage ? item : min),
                            trendsData.jobTypes[0],
                          ).type
                        }
                        の求人に応募する際は、特に慎重に内容を確認することをお勧めします。
                      </li>
                      <li>
                        <span className="font-medium">警戒すべき危険シグナル：</span> 「{(() => {
                          const counts = trendsData.redFlagsTrends.map((item: any) => {
                            const sum = item.data.reduce((acc: number, d: any) => acc + d.count, 0)
                            return { type: item.type, sum }
                          })
                          const maxType = counts.reduce(
                            (max: any, item: any) => (item.sum > max.sum ? item : max),
                            counts[0],
                          )
                          return formatFlagKey(maxType.type)
                        })()}
                        」が含まれる求人には特に注意が必要です。
                      </li>
                      <li>
                        <span className="font-medium">安全な求人の特徴：</span>{" "}
                        安全性スコアが高い求人は、明確な業務内容、適切な報酬設定、企業情報の透明性が確保されています。
                      </li>
                      <li>
                        <span className="font-medium">今後の動向予測：</span> 現在のトレンドが続くと、
                        {(() => {
                          const recent = trendsData.safetyScoreTrends.slice(-3)
                          const older = trendsData.safetyScoreTrends.slice(-6, -3)
                          const recentAvg =
                            recent.reduce((acc: number, item: any) => acc + item.averageScore, 0) / recent.length
                          const olderAvg =
                            older.reduce((acc: number, item: any) => acc + item.averageScore, 0) / older.length
                          const diff = recentAvg - olderAvg
                          return diff > 1
                            ? "求人市場の安全性は向上すると予測されます"
                            : diff < -1
                              ? "求人市場の安全性は低下する可能性があります"
                              : "求人市場の安全性は現状維持されると予測されます"
                        })()}。
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
