"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Download, MessageCircle, X, Save, Loader2 } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"
import { Chart, registerables } from "chart.js"
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnalysisChat } from "@/components/analysis-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

Chart.register(...registerables)

interface AnalysisResultDisplayProps {
  result: AnalysisResult
  isSaving?: boolean
  onSaveRequest?: () => void
}

export function AnalysisResultDisplay({ result, isSaving = false, onSaveRequest }: AnalysisResultDisplayProps) {
  const resultRef = useRef<HTMLDivElement>(null)
  const radarChartRef = useRef<HTMLCanvasElement>(null)
  const redFlagsChartRef = useRef<HTMLCanvasElement>(null)
  const riskFactorsChartRef = useRef<HTMLCanvasElement>(null)
  const comparativeChartRef = useRef<HTMLCanvasElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("analysis")
  const [chartsInitialized, setChartsInitialized] = useState(false)

  // Extract the actual analysis result data
  const analysisResult = "analysisResult" in result ? result.analysisResult : result

  const charts = useRef<{ [key: string]: Chart | null }>({
    radar: null,
    redFlags: null,
    riskFactors: null,
    comparative: null,
  })

  // チャートの初期化関数
  const initializeCharts = useCallback(() => {
    if (!analysisResult) return

    // レーダーチャート
    if (radarChartRef.current) {
      if (charts.current.radar) {
        charts.current.radar.destroy()
        charts.current.radar = null
      }

      const ctx = radarChartRef.current.getContext("2d")
      if (ctx) {
        try {
          charts.current.radar = new Chart(ctx, {
            type: "radar",
            data: {
              labels: ["安全性", "信頼性", "透明性", "合法性", "適切性"],
              datasets: [
                {
                  label: "求人分析スコア",
                  data: [
                    analysisResult.safetyScore,
                    analysisResult.confidenceLevel,
                    100 - (analysisResult.redFlags.lackOfCompanyInfo ? 100 : 0),
                    100 - (analysisResult.redFlags.illegalActivity ? 100 : 0),
                    100 - (analysisResult.redFlags.unclearJobDescription ? 100 : 0),
                  ],
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 2,
                  pointBackgroundColor: "rgba(54, 162, 235, 1)",
                  pointBorderColor: "#fff",
                  pointHoverBackgroundColor: "#fff",
                  pointHoverBorderColor: "rgba(54, 162, 235, 1)",
                  pointRadius: 4,
                },
              ],
            },
            options: {
              scales: {
                r: {
                  min: 0,
                  max: 100,
                  beginAtZero: true,
                  ticks: {
                    stepSize: 20,
                    font: {
                      size: 10,
                    },
                  },
                  pointLabels: {
                    font: {
                      size: 12,
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
                  display: true,
                  position: "bottom",
                  labels: {
                    font: {
                      size: 12,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`,
                  },
                  titleFont: {
                    size: 14,
                  },
                  bodyFont: {
                    size: 13,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.1,
                },
              },
            },
          })
        } catch (error) {
          console.error("レーダーチャートの初期化エラー:", error)
        }
      }
    }

    // 危険シグナルチャート
    if (redFlagsChartRef.current) {
      if (charts.current.redFlags) {
        charts.current.redFlags.destroy()
        charts.current.redFlags = null
      }

      const ctx = redFlagsChartRef.current.getContext("2d")
      if (ctx) {
        try {
          const redFlagsData = Object.entries(analysisResult.redFlags).map(([key, value]) => ({
            label: formatFlagKey(key),
            value: value ? 100 : 0,
          }))

          charts.current.redFlags = new Chart(ctx, {
            type: "bar",
            data: {
              labels: redFlagsData.map((d) => d.label),
              datasets: [
                {
                  label: "危険度",
                  data: redFlagsData.map((d) => d.value),
                  backgroundColor: redFlagsData.map((d) =>
                    d.value > 0 ? "rgba(255, 99, 132, 0.7)" : "rgba(75, 192, 192, 0.7)",
                  ),
                  borderColor: redFlagsData.map((d) =>
                    d.value > 0 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)",
                  ),
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ],
            },
            options: {
              indexAxis: "y",
              scales: {
                y: {
                  ticks: {
                    font: {
                      size: 11,
                    },
                  },
                },
                x: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => value + "%",
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number
                      return value > 0 ? "危険: 検出されました" : "安全: 問題なし"
                    },
                  },
                },
              },
            },
          })
        } catch (error) {
          console.error("危険シグナルチャートの初期化エラー:", error)
        }
      }
    }

    // リスク要因チャート
    if (riskFactorsChartRef.current) {
      if (charts.current.riskFactors) {
        charts.current.riskFactors.destroy()
        charts.current.riskFactors = null
      }

      const ctx = riskFactorsChartRef.current.getContext("2d")
      if (ctx) {
        try {
          const riskLevel = calculateRiskLevel(analysisResult)

          charts.current.riskFactors = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["安全", "要注意", "危険"],
              datasets: [
                {
                  data: [riskLevel.safe, riskLevel.warning, riskLevel.dangerous],
                  backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 206, 86, 0.7)", "rgba(255, 99, 132, 0.7)"],
                  borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(255, 99, 132, 1)"],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
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
                    label: (context) => `${context.label}: ${context.raw}%`,
                  },
                },
              },
            },
          })
        } catch (error) {
          console.error("リスク要因チャートの初期化エラー:", error)
        }
      }
    }

    // 比較チャート
    if (comparativeChartRef.current) {
      if (charts.current.comparative) {
        charts.current.comparative.destroy()
        charts.current.comparative = null
      }

      const ctx = comparativeChartRef.current.getContext("2d")
      if (ctx) {
        try {
          // サンプルの比較データ
          const compareData = {
            current: analysisResult.safetyScore,
            industry: 85,
            similar: 75,
            risky: 30,
          }

          charts.current.comparative = new Chart(ctx, {
            type: "bar",
            data: {
              labels: ["現在の求人", "業界平均", "類似求人平均", "危険求人平均"],
              datasets: [
                {
                  label: "安全性スコア比較",
                  data: Object.values(compareData),
                  backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(255, 99, 132, 0.7)",
                  ],
                  borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(255, 99, 132, 1)",
                  ],
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
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
              },
            },
          })
        } catch (error) {
          console.error("比較チャートの初期化エラー:", error)
        }
      }
    }

    setChartsInitialized(true)
  }, [analysisResult])

  // コンポーネントマウント時とresultが変更されたときにチャートを初期化
  useEffect(() => {
    // チャートの初期化を遅延させる
    const timer = setTimeout(() => {
      initializeCharts()
    }, 300)

    return () => {
      clearTimeout(timer)
      // クリーンアップ
      Object.values(charts.current).forEach((chart) => {
        if (chart) {
          chart.destroy()
        }
      })
      // チャート参照をリセット
      charts.current = {
        radar: null,
        redFlags: null,
        riskFactors: null,
        comparative: null,
      }
      setChartsInitialized(false)
    }
  }, [result, initializeCharts])

  // タブ切り替え時にチャートを再初期化
  useEffect(() => {
    if (activeTab === "analysis" && !chartsInitialized) {
      // 少し遅延させてDOMが完全に描画された後にチャートを初期化
      const timer = setTimeout(() => {
        initializeCharts()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [activeTab, chartsInitialized, initializeCharts])

  // ウィンドウのリサイズ時にチャートを再描画
  useEffect(() => {
    const handleResize = () => {
      // チャートが初期化されていれば再描画
      if (chartsInitialized) {
        Object.values(charts.current).forEach((chart) => {
          if (chart) {
            chart.resize()
          }
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [chartsInitialized])

  const downloadAsImage = async () => {
    if (!resultRef.current) return

    try {
      setIsDownloading(true)

      // 画像としてキャプチャする前に、ダウンロードボタンを非表示にする
      const downloadBtn = resultRef.current.querySelector(".download-btn")
      if (downloadBtn) {
        downloadBtn.classList.add("hidden")
      }

      // ダークモードの場合は一時的に背景を白に変更
      const isDarkMode = document.documentElement.classList.contains("dark")
      if (isDarkMode) {
        resultRef.current.classList.add("bg-white", "text-black")
        const darkElements = resultRef.current.querySelectorAll('[class*="dark:"]')
        darkElements.forEach((el) => {
          // ダークモード用のクラスを一時的に無効化
          el.classList.forEach((cls) => {
            if (cls.startsWith("dark:")) {
              el.classList.add("temp-remove-dark")
            }
          })
        })
      }

      const canvas = await html2canvas(resultRef.current, {
        scale: 2, // 高解像度
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      })

      // ダークモードの設定を元に戻す
      if (isDarkMode) {
        resultRef.current.classList.remove("bg-white", "text-black")
        const tempRemovedElements = resultRef.current.querySelectorAll(".temp-remove-dark")
        tempRemovedElements.forEach((el) => {
          el.classList.remove("temp-remove-dark")
        })
      }

      // ダウンロードボタンを再表示
      if (downloadBtn) {
        downloadBtn.classList.remove("hidden")
      }

      // 画像をダウンロード
      const link = document.createElement("a")
      link.download = `求人分析結果_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("画像のダウンロード中にエラーが発生しました:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-lime-500"
    if (score >= 40) return "bg-amber-500"
    if (score >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return "非常に安全"
    if (score >= 60) return "安全"
    if (score >= 40) return "注意"
    if (score >= 20) return "危険"
    return "非常に危険"
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

  const calculateRiskLevel = (result: any) => {
    return {
      safe: result.safetyScore,
      warning: 100 - result.safetyScore - (result.redFlags.illegalActivity ? 30 : 0),
      dangerous: result.redFlags.illegalActivity ? 30 : 0,
    }
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    if (!showChat) {
      setActiveTab("chat")
    } else {
      setActiveTab("analysis")
    }
  }

  return (
    <div ref={resultRef} className="space-y-6 bg-background p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">求人安全性分析結果</h2>
        <div className="flex gap-2">
          {!result.savedToHistory && onSaveRequest && (
            <Button
              onClick={onSaveRequest}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  履歴に保存
                </>
              )}
            </Button>
          )}
          <Button onClick={toggleChat} variant="outline" size="sm" className="flex items-center gap-1">
            {showChat ? (
              <>
                <X className="h-4 w-4" />
                チャットを閉じる
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                AIに質問する
              </>
            )}
          </Button>
          <Button
            onClick={downloadAsImage}
            disabled={isDownloading}
            className="download-btn"
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "処理中..." : "画像として保存"}
          </Button>
        </div>
      </div>

      {showChat ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">分析結果</TabsTrigger>
            <TabsTrigger value="chat">AIチャット</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis" className="mt-4">
            <AnalysisContent
              analysisResult={analysisResult}
              getScoreColor={getScoreColor}
              getScoreText={getScoreText}
              formatFlagKey={formatFlagKey}
              radarChartRef={radarChartRef}
              redFlagsChartRef={redFlagsChartRef}
              riskFactorsChartRef={riskFactorsChartRef}
              comparativeChartRef={comparativeChartRef}
              result={result}
              chartsInitialized={chartsInitialized}
            />
          </TabsContent>
          <TabsContent value="chat" className="mt-4">
            <AnalysisChat result={result} />
          </TabsContent>
        </Tabs>
      ) : (
        <AnalysisContent
          analysisResult={analysisResult}
          getScoreColor={getScoreColor}
          getScoreText={getScoreText}
          formatFlagKey={formatFlagKey}
          radarChartRef={radarChartRef}
          redFlagsChartRef={redFlagsChartRef}
          riskFactorsChartRef={riskFactorsChartRef}
          comparativeChartRef={comparativeChartRef}
          result={result}
          chartsInitialized={chartsInitialized}
        />
      )}
    </div>
  )
}

// 分析結果コンテンツを別コンポーネントとして切り出し
function AnalysisContent({
  analysisResult,
  getScoreColor,
  getScoreText,
  formatFlagKey,
  radarChartRef,
  redFlagsChartRef,
  riskFactorsChartRef,
  comparativeChartRef,
  result,
  chartsInitialized,
}: {
  analysisResult: any
  getScoreColor: (score: number) => string
  getScoreText: (score: number) => string
  formatFlagKey: (key: string) => string
  radarChartRef: React.RefObject<HTMLCanvasElement>
  redFlagsChartRef: React.RefObject<HTMLCanvasElement>
  riskFactorsChartRef: React.RefObject<HTMLCanvasElement>
  comparativeChartRef: React.RefObject<HTMLCanvasElement>
  result: AnalysisResult
  chartsInitialized?: boolean
}) {
  return (
    <>
      <div
        className={cn(
          "p-4 rounded-lg flex items-center gap-3",
          analysisResult.isSafe
            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
        )}
      >
        {analysisResult.isSafe ? (
          <CheckCircle className="h-6 w-6 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
        )}
        <div>
          <div className="font-medium text-lg">
            {analysisResult.isSafe ? "安全な正規バイト" : "危険な闇バイトの可能性"}
          </div>
          <div className="text-sm mt-1">
            {analysisResult.isSafe
              ? "分析の結果、この求人は安全な正規のアルバイトと判断されました。"
              : "分析の結果、この求人には危険な要素が含まれている可能性があります。"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2 items-center">
              <div>
                <h3 className="text-lg font-medium">安全性スコア</h3>
                <p className="text-sm text-muted-foreground">求人の安全性を0-100%で評価</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{analysisResult.safetyScore}%</span>
                <div
                  className={cn(
                    "text-sm font-medium",
                    analysisResult.safetyScore >= 60
                      ? "text-green-600"
                      : analysisResult.safetyScore >= 40
                        ? "text-amber-600"
                        : "text-red-600",
                  )}
                >
                  {getScoreText(analysisResult.safetyScore)}
                </div>
              </div>
            </div>
            <Progress
              value={analysisResult.safetyScore}
              className="h-3"
              indicatorClassName={getScoreColor(analysisResult.safetyScore)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2 items-center">
              <div>
                <h3 className="text-lg font-medium">分析確信度</h3>
                <p className="text-sm text-muted-foreground">AIの分析結果の信頼性</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{analysisResult.confidenceLevel}%</span>
              </div>
            </div>
            <Progress
              value={analysisResult.confidenceLevel}
              className="h-3"
              indicatorClassName={getScoreColor(analysisResult.confidenceLevel)}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">危険シグナル分析</h3>
            <div className="h-[250px] relative">
              <canvas ref={redFlagsChartRef}></canvas>
              {!chartsInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">総合評価</h3>
          <div className="h-[300px] relative">
            <canvas ref={radarChartRef}></canvas>
            {!chartsInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">検出された危険シグナル</h4>
            <ul className="space-y-2">
              {Object.entries(analysisResult.redFlags).map(([key, value]) => (
                <li
                  key={key}
                  className={cn(
                    "text-sm flex items-center gap-2 p-2 rounded-md",
                    value
                      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                  )}
                >
                  {value ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-medium">{formatFlagKey(key)}</div>
                    <div className="text-xs mt-0.5">
                      {value ? getFlagDescription(key, true) : getFlagDescription(key, false)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {analysisResult.warningFlags && analysisResult.warningFlags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">警告フラグ</h3>
          <div className="bg-amber-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysisResult.warningFlags.map((warning: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-lg font-medium">詳細分析</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>{analysisResult.safetyAnalysis}</p>

              {analysisResult.reasonsForConcern && analysisResult.reasonsForConcern.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">懸念事項</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.reasonsForConcern.map((reason: string, index: number) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.legalIssues && analysisResult.legalIssues.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">法的問題点</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.legalIssues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">リスク要因の詳細分析</h3>
          <div className="h-[250px] relative">
            <canvas ref={riskFactorsChartRef}></canvas>
            {!chartsInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">類似求人との比較</h3>
          <div className="h-[250px] relative">
            <canvas ref={comparativeChartRef}></canvas>
            {!chartsInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            ※業界平均・類似求人平均・危険求人平均は参考値です
          </div>
        </div>
      </div>

      {analysisResult.recommendedActions && analysisResult.recommendedActions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">推奨される行動</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysisResult.recommendedActions.map((action: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2 text-blue-800">
                  <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {analysisResult.alternativeJobSuggestions && analysisResult.alternativeJobSuggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">代替求人の提案</h3>
          <div className="bg-green-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysisResult.alternativeJobSuggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2 text-green-800">
                  <div className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-4 mt-8">
        <div className="flex justify-between items-center">
          <p>分析日時: {new Date(result.timestamp).toLocaleString("ja-JP")}</p>
          {result.savedToHistory !== undefined && (
            <p className={`flex items-center gap-1 ${result.savedToHistory ? "text-green-600" : "text-amber-600"}`}>
              {result.savedToHistory ? (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>履歴に保存済み</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>履歴に保存されていません</span>
                </>
              )}
            </p>
          )}
        </div>
        <p className="mt-2">
          ※この分析結果はAIによる自動判定であり、実際の求人の安全性を保証するものではありません。応募の際は十分にご注意ください。
        </p>
      </div>
    </>
  )
}

// 危険シグナルの詳細説明
function getFlagDescription(key: string, isDetected: boolean): string {
  const descriptions: { [key: string]: { detected: string; safe: string } } = {
    unrealisticPay: {
      detected: "一般的な相場と比較して不自然に高い報酬が提示されています。",
      safe: "報酬額は一般的な相場の範囲内です。",
    },
    lackOfCompanyInfo: {
      detected: "企業情報や雇用条件が明確に記載されていません。",
      safe: "企業情報や雇用条件が適切に記載されています。",
    },
    requestForPersonalInfo: {
      detected: "応募前の段階で過度な個人情報の提供を求めています。",
      safe: "個人情報の取り扱いに問題は見られません。",
    },
    unclearJobDescription: {
      detected: "具体的な業務内容が明確に説明されていません。",
      safe: "業務内容が具体的かつ明確に説明されています。",
    },
    illegalActivity: {
      detected: "違法行為や犯罪に関連する可能性のある表現が含まれています。",
      safe: "違法行為や犯罪に関連する表現は見られません。",
    },
  }

  return descriptions[key]
    ? isDetected
      ? descriptions[key].detected
      : descriptions[key].safe
    : "詳細情報がありません。"
}
