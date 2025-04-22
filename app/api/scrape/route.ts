import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 })
    }

    // URLの検証
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json({ error: "有効なURLを入力してください" }, { status: 400 })
    }

    // 実際のスクレイピングロジックの代わりに、モックデータを返す
    // 注: 実際のプロダクションでは、適切なスクレイピングライブラリを使用するか、
    // サーバーサイドでHTMLを解析する必要があります
    const jobDescription = await mockScrapeJobDescription(url)

    return NextResponse.json({ jobDescription })
  } catch (error) {
    console.error("Error during scraping:", error)
    return NextResponse.json(
      { error: "Scraping failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// モックスクレイピング関数
async function mockScrapeJobDescription(url: string): Promise<string> {
  // URLのドメインに基づいて異なるモックデータを返す
  const domain = new URL(url).hostname.toLowerCase()

  // 待機時間を追加して実際のスクレイピングをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (domain.includes("indeed") || domain.includes("indeedcom")) {
    return "【Indeed】東京都内のオフィスワーク。時給1,300円、交通費支給。週3日から勤務可能。データ入力や書類整理などの一般事務業務。未経験者歓迎、研修制度あり。社会保険完備。"
  } else if (domain.includes("townwork") || domain.includes("タウンワーク")) {
    return "【タウンワーク】カフェスタッフ募集！時給1,050円〜、シフト制、週2日〜OK。接客、ドリンク作り、レジ対応など。学生・フリーター歓迎。まかない付き、交通費一部支給。"
  } else if (domain.includes("baito") || domain.includes("バイト")) {
    return "【バイトル】コンビニスタッフ大募集！時給1,100円〜、深夜手当あり。レジ打ち、品出し、清掃など。未経験者歓迎、研修あり。シフト相談可能、学生・フリーター活躍中。"
  } else if (domain.includes("wantedly")) {
    return "【Wantedly】ITベンチャー企業でのマーケティングインターン募集。週3日〜、リモートワーク可。SNS運用、コンテンツ制作、データ分析など。実務経験を積みたい学生歓迎。交通費支給、社員登用の可能性あり。"
  } else if (domain.includes("suspicious") || domain.includes("怪しい")) {
    // 怪しい求人の例
    return "【急募】簡単作業で日給3万円保証！ノルマなし、即日払いOK。身分証のみで即採用。内容は当日説明します。LINE登録で詳細をお伝えします。学生・フリーター大歓迎！シフト自由！"
  } else {
    // デフォルトの求人情報
    return "一般事務のアルバイト募集。時給1,200円、交通費支給。勤務時間は平日10時〜17時。書類整理やデータ入力が主な業務です。未経験者歓迎、研修制度あり。週3日から勤務可能、シフト相談可。社会保険完備、正社員登用制度あり。"
  }
}
