"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Link, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface URLScannerProps {
  onScanComplete: (jobDescription: string) => void
}

export function URLScanner({ onScanComplete }: URLScannerProps) {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError("URLを入力してください。")
      return
    }

    try {
      setIsScanning(true)
      setError(null)

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "スキャンに失敗しました")
      }

      const data = await response.json()
      onScanComplete(data.jobDescription)
    } catch (error) {
      if (error instanceof Error) {
        setError(`スキャン中にエラーが発生しました: ${error.message}`)
      } else {
        setError("スキャン中に不明なエラーが発生しました")
      }
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Link className="h-4 w-4 mr-2 text-primary" />
              <h3 className="text-sm font-medium">求人URLからスキャン</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              求人サイトのURLを入力すると、自動的に求人内容を取得して分析します。
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/job/12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isScanning || !url.trim()}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  スキャン中...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  スキャン
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>対応サイト例: Indeed, タウンワーク, バイトル, Wantedly など</p>
            <p>※ テスト用に「suspicious.com」を含むURLを入力すると、危険な求人例が表示されます</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

