"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // マウント後にのみレンダリング
  useEffect(() => {
    setMounted(true)
  }, [])

  // テーマを切り替える関数
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  if (!mounted) {
    // マウント前はボタンだけ表示（機能なし）
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">テーマを切り替える</span>
      </Button>
    )
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9" aria-label="テーマを切り替える">
      {theme === "dark" ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">{theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}</span>
    </Button>
  )
}
