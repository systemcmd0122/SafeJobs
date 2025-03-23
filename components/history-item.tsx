"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Download } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface HistoryItemProps {
  analysis: AnalysisResult
}

export function HistoryItem({ analysis }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const date = new Date(analysis.timestamp).toLocaleString("ja-JP")

  // Extract the actual analysis result data
  const result = analysis.analysisResult

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

  const downloadAsImage = async () => {
    if (!isExpanded) {
      setIsExpanded(true)
      // 展開後にDOMが更新されるのを待つ
      setTimeout(() => downloadImage(), 100)
    } else {
      downloadImage()
    }
  }

  const downloadImage = async () => {
    const element = document.getElementById(`history-item-${analysis.filename}`)
    if (!element) return

    try {
      setIsDownloading(true)

      // ダウンロードボタンを非表示
      const downloadBtn = element.querySelector(".download-btn")
      if (downloadBtn) {
        downloadBtn.classList.add("hidden")
      }

      // ダークモードの場合は一時的に背景を白に変更
      const isDarkMode = document.documentElement.classList.contains("dark")
      if (isDarkMode) {
        element.classList.add("bg-white", "text-black")
        const darkElements = element.querySelectorAll('[class*="dark:"]')
        darkElements.forEach((el) => {
          // ダークモード用のクラスを一時的に無効化
          el.classList.forEach((cls) => {
            if (cls.startsWith("dark:")) {
              el.classList.add("temp-remove-dark")
            }
          })
        })
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      })

      // ダークモードの設定を元に戻す
      if (isDarkMode) {
        element.classList.remove("bg-white", "text-black")
        const tempRemovedElements = element.querySelectorAll(".temp-remove-dark")
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

  return (
    <Card id={`history-item-${analysis.filename}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">{date}</div>
          <div className="flex gap-2">
            <Button
              onClick={downloadAsImage}
              disabled={isDownloading}
              className="download-btn"
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "処理中..." : "画像保存"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 px-2">
              {isExpanded ? (
                <>
                  <span className="mr-1">詳細を隠す</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="mr-1">詳細を表示</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <strong className="text-sm">求人内容:</strong>
          <p className="text-sm mt-1 bg-gray-50 p-2 rounded-md">{analysis.jobDescription}</p>
        </div>

        <div
          className={cn(
            "p-3 rounded-md flex items-center gap-2 mb-2",
            result.isSafe
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
          )}
        >
          {result.isSafe ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          )}
          <div>
            <span className="text-sm font-medium">{result.isSafe ? "安全な正規バイト" : "危険な闇バイトの可能性"}</span>
            <div className="flex items-center gap-4 mt-1">
              <div className="text-xs">
                安全性スコア: <span className="font-semibold">{result.safetyScore}%</span>
                <span className="ml-1">({getScoreText(result.safetyScore)})</span>
              </div>
              <div className="text-xs">
                確信度: <span className="font-semibold">{result.confidenceLevel}%</span>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">安全性スコア詳細</h4>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>安全性スコア</span>
                    <span>{result.safetyScore}%</span>
                  </div>
                  <Progress
                    value={result.safetyScore}
                    className="h-2"
                    indicatorClassName={getScoreColor(result.safetyScore)}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>分析確信度</span>
                    <span>{result.confidenceLevel}%</span>
                  </div>
                  <Progress
                    value={result.confidenceLevel}
                    className="h-2"
                    indicatorClassName={getScoreColor(result.confidenceLevel)}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">検出された危険シグナル</h4>
                <ul className="space-y-1">
                  {Object.entries(result.redFlags).map(([key, value]) => (
                    <li
                      key={key}
                      className={cn(
                        "text-xs flex items-center gap-1 p-1 rounded",
                        value ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600",
                      )}
                    >
                      {value ? (
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      {formatFlagKey(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm font-medium py-2">詳細情報</AccordionTrigger>
                <AccordionContent>
                  {result.warningFlags.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1">警告フラグ</h4>
                      <ul className="space-y-1 bg-amber-50 p-2 rounded-md">
                        {result.warningFlags.map((warning: string, index: number) => (
                          <li key={index} className="text-xs flex items-start gap-1 text-amber-700">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3">
                    <h4 className="text-xs font-medium mb-1">分析詳細</h4>
                    <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded-md">{result.safetyAnalysis}</p>
                  </div>

                  {result.reasonsForConcern.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1">懸念事項</h4>
                      <ul className="space-y-1 text-xs list-disc pl-4">
                        {result.reasonsForConcern.map((reason: string, index: number) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.legalIssues.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1">法的問題点</h4>
                      <ul className="space-y-1 text-xs list-disc pl-4">
                        {result.legalIssues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendedActions.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1">推奨される行動</h4>
                      <ul className="space-y-1 bg-blue-50 p-2 rounded-md">
                        {result.recommendedActions.map((action: string, index: number) => (
                          <li key={index} className="text-xs flex items-start gap-1 text-blue-700">
                            <div className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
                              {index + 1}
                            </div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

