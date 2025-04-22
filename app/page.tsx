import { JobAnalyzer } from "@/components/job-analyzer"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeDebug } from "@/components/theme-debug"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <JobAnalyzer />
      </main>
      <Footer />
      {/* 開発時のみ表示するデバッグコンポーネント */}
      {process.env.NODE_ENV === "development" && <ThemeDebug />}
    </div>
  )
}
