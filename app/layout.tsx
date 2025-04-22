import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PolicyConsentModal } from "@/components/policy-consent-modal"
import { PolicyConsentBanner } from "@/components/policy-consent-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "求人安全性分析ツール v2.0",
  description: "闇バイトのリスクを検出するAI搭載ツール",
  generator: 'v0.dev',
  // Add OpenGraph metadata
  openGraph: {
    title: "求人安全性分析ツール v2.0",
    description: "闇バイトのリスクを検出するAI搭載ツール",
    type: "website",
    locale: "ja_JP",
    siteName: "SafeJobs",
    // You should add an actual image URL here
    images: [
      {
        url: "/og-image.png", // Add your actual OG image path
        width: 1200,
        height: 630,
        alt: "SafeJobs - 求人安全性分析ツール",
      },
    ],
  },
  // Add Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "求人安全性分析ツール v2.0",
    description: "闇バイトのリスクを検出するAI搭載ツール",
    // You should add an actual image URL here
    images: ["/og-image.png"], // Add your actual Twitter card image path
  },
  // Additional metadata
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <PolicyConsentModal />
          <PolicyConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}