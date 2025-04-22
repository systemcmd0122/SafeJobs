"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, X, ArrowLeftRight } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ComparisonTabProps {
  setError: (error: string | null) => void
}

export function ComparisonTab({ setError }: ComparisonTabProps) {
  const [jobs, setJobs] = useState<{ id: string; description: string; result: AnalysisResult | null }[]>([
    { id: "job1", description: "", result: null },
    { id: "job2", description: "", result: null },
  ])
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({})
  const [activeTab, setActiveTab] = useState("input")

  const handleJobDescriptionChange = (id: string, value: string) => {
    setJobs(
      jobs.map((job) => {
        if (job.id === id) {
          return { ...job, description: value }
        }
        return job
      }),
    )
  }

  const addJob = () => {
    if (jobs.length < 4) {
      setJobs([...jobs, { id: `job${jobs.length + 1}`, description: "", result: null }])
    }
  }

  const removeJob = (id: string) => {
    if (jobs.length > 2) {
      setJobs(jobs.filter((job) => job.id !== id))
    }
  }

  const analyzeJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id)
    if (!job || !job.description.trim()) {
      setError("求人内容を入力してください。")
      return
    }

    try {
      setIsAnalyzing({ ...isAnalyzing, [id]: true })
      setError(null)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription: job.description }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "分析に失敗しました")
      }

      const data = await response.json()

      setJobs(
        jobs.map((j) => {
          if (j.id === id) {
            return { ...j, result: data }
          }
          return j
        }),
      )

      // すべての求人が分析されたら結果タブに切り替え
      const allAnalyzed = jobs.every((j) => j.id === id || j.result !== null)
      if (allAnalyzed) {
        setActiveTab("results")
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`分析中にエラーが発生しました: ${error.message}`)
      } else {
        setError("分析中に不明なエラーが発生しました")
      }
    } finally {
      setIsAnalyzing({ ...isAnalyzing, [id]: false })
    }
  }

  const analyzeAllJobs = async () => {
    const jobsToAnalyze = jobs.filter((job) => job.description.trim() !== "")
    if (jobsToAnalyze.length === 0) {
      setError("少なくとも1つの求人内容を入力してください。")
      return
    }

    try {
      setError(null)
      const newIsAnalyzing = { ...isAnalyzing }

      for (const job of jobsToAnalyze) {
        newIsAnalyzing[job.id] = true
        setIsAnalyzing(newIsAnalyzing)

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobDescription: job.description }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "分析に失敗しました")
        }

        const data = await response.json()

        setJobs((prevJobs) =>
          prevJobs.map((j) => {
            if (j.id === job.id) {
              return { ...j, result: data }
            }
            return j
          }),
        )

        newIsAnalyzing[job.id] = false
        setIsAnalyzing({ ...newIsAnalyzing })
      }

      // 分析が完了したら結果タブに切り替え
      setActiveTab("results")
    } catch (error) {
      if (error instanceof Error) {
        setError(`分析中にエラーが発生しました: ${error.message}`)
      } else {
        setError("分析中に不明なエラーが発生しました")
      }
    } finally {
      const resetAnalyzing = {}
      jobs.forEach((job) => {
        resetAnalyzing[job.id] = false
      })
      setIsAnalyzing(resetAnalyzing)
    }
  }

  const resetAll = () => {
    setJobs([
      { id: "job1", description: "", result: null },
      { id: "job2", description: "", result: null },
    ])
    setActiveTab("input")
    setError(null)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">求人比較分析</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetAll}>
            リセット
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">入力</TabsTrigger>
          <TabsTrigger value="results" disabled={!jobs.some((job) => job.result !== null)}>
            比較結果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4 mt-4">
          {jobs.map((job) => (
            <Card key={job.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium">求人 #{job.id.replace("job", "")}</h3>
                  {jobs.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeJob(job.id)}
                      aria-label="求人を削除"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="求人内容を入力してください..."
                  rows={4}
                  value={job.description}
                  onChange={(e) => handleJobDescriptionChange(job.id, e.target.value)}
                  className="mb-3 resize-y min-h-[100px]"
                />
                <Button
                  onClick={() => analyzeJob(job.id)}
                  disabled={isAnalyzing[job.id] || !job.description.trim()}
                  className="w-full"
                >
                  {isAnalyzing[job.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    "この求人を分析"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={addJob} disabled={jobs.length >= 4} className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              求人を追加
            </Button>
            <Button
              onClick={analyzeAllJobs}
              disabled={Object.values(isAnalyzing).some((v) => v) || !jobs.some((job) => job.description.trim() !== "")}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              すべての求人を比較分析
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs
              .filter((job) => job.result !== null)
              .map((job) => {
                const result = job.result!.analysisResult
                return (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="text-md font-medium mb-2">求人 #{job.id.replace("job", "")}</h3>
                      <div className="bg-gray-50 p-2 rounded-md mb-3 text-sm max-h-[100px] overflow-y-auto">
                        {job.description}
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-md flex items-center gap-2 mb-3",
                          result.isSafe
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                        )}
                      >
                        <div className="font-medium">
                          {result.isSafe ? "安全な正規バイト" : "危険な闇バイトの可能性"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>安全性スコア</span>
                            <span className="font-medium">{result.safetyScore}%</span>
                          </div>
                          <Progress
                            value={result.safetyScore}
                            className="h-2"
                            indicatorClassName={getScoreColor(result.safetyScore)}
                          />
                          <div className="text-xs text-right mt-1">{getScoreText(result.safetyScore)}</div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>分析確信度</span>
                            <span className="font-medium">{result.confidenceLevel}%</span>
                          </div>
                          <Progress
                            value={result.confidenceLevel}
                            className="h-2"
                            indicatorClassName={getScoreColor(result.confidenceLevel)}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">検出された危険シグナル</h4>
                        <div className="space-y-1">
                          {Object.entries(result.redFlags).map(([key, value]) => (
                            <div
                              key={key}
                              className={cn(
                                "text-xs p-1 rounded flex items-center",
                                value ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600",
                              )}
                            >
                              <span
                                className={cn("w-2 h-2 rounded-full mr-2", value ? "bg-red-500" : "bg-green-500")}
                              />
                              {formatFlagKey(key)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>

          {jobs.filter((job) => job.result !== null).length > 1 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">比較分析</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">安全性スコア比較</h4>
                    <div className="space-y-2">
                      {jobs
                        .filter((job) => job.result !== null)
                        .map((job) => {
                          const result = job.result!.analysisResult
                          return (
                            <div key={job.id} className="flex items-center gap-2">
                              <div className="w-24 text-sm">求人 #{job.id.replace("job", "")}</div>
                              <Progress
                                value={result.safetyScore}
                                className="h-4 flex-1"
                                indicatorClassName={getScoreColor(result.safetyScore)}
                              />
                              <div className="w-12 text-right text-sm font-medium">{result.safetyScore}%</div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">危険シグナル比較</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">危険シグナル</th>
                            {jobs
                              .filter((job) => job.result !== null)
                              .map((job) => (
                                <th key={job.id} className="text-center py-2 px-2">
                                  求人 #{job.id.replace("job", "")}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(jobs[0]?.result?.analysisResult.redFlags || {}).map((key) => (
                            <tr key={key} className="border-b">
                              <td className="py-2 pr-4">{formatFlagKey(key)}</td>
                              {jobs
                                .filter((job) => job.result !== null)
                                .map((job) => {
                                  const value = job.result?.analysisResult.redFlags[key as keyof typeof job.result!.analysisResult.redFlags
                                  ]
                                  return (
                                    <td key={job.id} className="text-center py-2 px-2">
                                      <span
                                        className={cn(
                                          "inline-block w-4 h-4 rounded-full",
                                          value ? "bg-red-500" : "bg-green-500",
                                        )}
                                      />
                                    </td>
                                  )
                                })}
                            </tr>
                          ))}
                          \
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">総合評価</h4>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800">
                        {(() => {
                          const results = jobs
                            .filter((job) => job.result !== null)
                            .map((job) => job.result!.analysisResult)
                          const safeJobs = results.filter((r) => r.isSafe)
                          const unsafeJobs = results.filter((r) => !r.isSafe)

                          if (safeJobs.length === results.length) {
                            return "比較した全ての求人は安全と判断されました。通常の雇用条件が提示されており、特に懸念される点はありません。"
                          } else if (unsafeJobs.length === results.length) {
                            return "比較した全ての求人に危険な要素が含まれています。応募する際は十分な注意が必要です。"
                          } else {
                            const safestJob = [...results].sort((a, b) => b.safetyScore - a.safetyScore)[0]
                            const safestJobIndex = results.indexOf(safestJob) + 1
                            return `比較した求人の中では、求人 #${safestJobIndex} が最も安全性が高いと判断されました（安全性スコア: ${safestJob.safetyScore}%）。他の求人と比較して、危険シグナルが少なく、雇用条件が明確に提示されています。`
                          }
                        })()}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
