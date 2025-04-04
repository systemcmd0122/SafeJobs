"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"

export function PolicyConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      // ローカルストレージから同意状態を確認
      const consent = localStorage.getItem("policy-consent")
      if (consent === "accepted") {
        setShow(false)
      } else {
        // 少し遅延させて表示（ポリシーモーダルとの競合を避けるため）
        const timer = setTimeout(() => {
          setShow(true)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("policy-consent", "accepted")
    }
    setShow(false)
  }

  if (!show) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm">
            当サイトでは、分析結果の品質向上のためにデータを収集・利用しています。
            <Link href="/policy" className="underline ml-1">
              詳細を見る
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShow(false)}>
            後で
          </Button>
          <Button size="sm" onClick={handleAccept}>
            同意する
          </Button>
        </div>
      </div>
    </div>
  )
}

