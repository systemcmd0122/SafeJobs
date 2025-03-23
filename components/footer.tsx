export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 求人安全性分析ツール. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          このツールはAIを使用して求人の安全性を分析します。結果は参考情報であり、完全な安全性を保証するものではありません。
        </p>
      </div>
    </footer>
  )
}

