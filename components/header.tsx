import { ThemeToggle } from "@/components/theme-toggle"
import { Shield } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">求人安全性分析ツール</h1>
            <p className="text-xs text-muted-foreground">闇バイトのリスクを検出するAI搭載ツール</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
