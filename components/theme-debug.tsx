"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeDebug() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border p-4 rounded-lg shadow-lg z-50 text-xs">
      <div>現在のテーマ: {theme}</div>
      <div>解決されたテーマ: {resolvedTheme}</div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setTheme("light")} className="px-2 py-1 bg-primary text-primary-foreground rounded">
          ライト
        </button>
        <button onClick={() => setTheme("dark")} className="px-2 py-1 bg-primary text-primary-foreground rounded">
          ダーク
        </button>
        <button onClick={() => setTheme("system")} className="px-2 py-1 bg-primary text-primary-foreground rounded">
          システム
        </button>
      </div>
    </div>
  )
}

