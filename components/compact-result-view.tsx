"use client"

import { useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle } from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"
import { cn } from "@/lib/utils"

interface CompactResultViewProps {
  result: AnalysisResult
}

export function CompactResultView({ result }: CompactResultViewProps) {
  const resultRef = useRef<HTMLDivElement>(null)

  // Extract the actual analysis result data
  const analysisResult = "analysisResult" in result ? result.analysisResult : result

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
    <div ref={resultRef} className="space-y-4 bg-white p-4 rounded-lg w-[600px]">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">求人安全性分析結果</h2>
        <div className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString("ja-JP")}</div>
      </div>

      <div
        className={cn(
          "p-3 rounded-lg flex items-center gap-2",
          analysisResult.isSafe ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
        )}
      >
        {analysisResult.isSafe ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        )}
        <div>
          <div className="font-medium">{analysisResult.isSafe ? "安全な正規バイト" : "危険な闇バイトの可能性"}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1 items-center">
            <div className="text-sm font-medium">安全性スコア</div>
            <div className="text-right">
              <span className="text-lg font-bold">{analysisResult.safetyScore}%</span>
              <div className="text-xs font-medium">{getScoreText(analysisResult.safetyScore)}</div>
            </div>
          </div>
          <Progress
            value={analysisResult.safetyScore}
            className="h-2"
            indicatorClassName={getScoreColor(analysisResult.safetyScore)}
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 items-center">
            <div className="text-sm font-medium">分析確信度</div>
            <div className="text-right">
              <span className="text-lg font-bold">{analysisResult.confidenceLevel}%</span>
            </div>
          </div>
          <Progress
            value={analysisResult.confidenceLevel}
            className="h-2"
            indicatorClassName={getScoreColor(analysisResult.confidenceLevel)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">検出された危険シグナル</h4>
          <ul className="space-y-1">
            {Object.entries(analysisResult.redFlags).map(([key, value]) => (
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

        <div>
          {analysisResult.warningFlags.length > 0 ? (
            <>
              <h4 className="text-sm font-medium mb-2">警告フラグ</h4>
              <ul className="space-y-1">
                {analysisResult.warningFlags.slice(0, 3).map((warning, index) => (
                  <li key={index} className="text-xs flex items-start gap-1 text-amber-700 bg-amber-50 p-1 rounded">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{warning}</span>
                  </li>
                ))}
                {analysisResult.warningFlags.length > 3 && (
                  <li className="text-xs text-amber-700">他 {analysisResult.warningFlags.length - 3} 件...</li>
                )}
              </ul>
            </>
          ) : (
            <>
              <h4 className="text-sm font-medium mb-2">推奨される行動</h4>
              <ul className="space-y-1">
                {analysisResult.recommendedActions.slice(0, 3).map((action, index) => (
                  <li key={index} className="text-xs flex items-start gap-1 text-blue-700 bg-blue-50 p-1 rounded">
                    <div className="bg-blue-200 text-blue-800 rounded-full w-3 h-3 flex items-center justify-center flex-shrink-0 mt-0.5 text-[8px]">
                      {index + 1}
                    </div>
                    <span className="line-clamp-1">{action}</span>
                  </li>
                ))}
                {analysisResult.recommendedActions.length > 3 && (
                  <li className="text-xs text-blue-700">他 {analysisResult.recommendedActions.length - 3} 件...</li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2">
        <p>※この分析結果はAIによる自動判定であり、実際の求人の安全性を保証するものではありません。</p>
      </div>
    </div>
  )
}

