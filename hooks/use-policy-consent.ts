"use client"

import { useState, useEffect } from "react"

export function usePolicyConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("policy-consent")
      setHasConsented(consent === "accepted")
      setIsLoading(false)
    }
  }, [])

  const setConsent = (value: boolean) => {
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem("policy-consent", "accepted")
      } else {
        localStorage.removeItem("policy-consent")
      }
      setHasConsented(value)
    }
  }

  return { hasConsented, isLoading, setConsent }
}
