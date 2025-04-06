"use client"

import { useState, useEffect } from "react"

export function useAnalysisConsent() {
  // 解析結果保存の同意状態
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 常に確認するか、前回の選択を記憶するか
  const [alwaysAsk, setAlwaysAsk] = useState(true)

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      // ローカルストレージから同意状態を確認
      const consent = localStorage.getItem("analysis-save-consent")
      const askSetting = localStorage.getItem("analysis-always-ask")

      if (consent === "true") {
        setHasConsented(true)
      } else if (consent === "false") {
        setHasConsented(false)
      } else {
        setHasConsented(null)
      }

      setAlwaysAsk(askSetting !== "false")
      setIsLoading(false)
    }
  }, [])

  const setConsent = (value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("analysis-save-consent", value.toString())
      setHasConsented(value)
    }
  }

  const setAskPreference = (value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("analysis-always-ask", value.toString())
      setAlwaysAsk(value)
    }
  }

  // 現在の設定に基づいて、確認が必要かどうかを判断
  const shouldAskForConsent = () => {
    return alwaysAsk || hasConsented === null
  }

  return {
    hasConsented,
    isLoading,
    setConsent,
    alwaysAsk,
    setAskPreference,
    shouldAskForConsent,
  }
}

