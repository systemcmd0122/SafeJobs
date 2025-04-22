import { jsPDF } from "jspdf"
import type { AnalysisResult } from "@/types/analysis"

// PDFレポートを生成する関数
export async function generatePdfReport(result: AnalysisResult): Promise<string> {
  // jsPDFのインスタンスを作成（A4サイズ、縦向き）
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // フォントの設定
  doc.setFont("helvetica", "normal")

  // タイトルを追加
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text("求人安全性分析レポート", 105, 20, { align: "center" })

  // 日時を追加
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`分析日時: ${new Date(result.timestamp).toLocaleString("ja-JP")}`, 105, 30, { align: "center" })

  // 区切り線
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 35, 190, 35)

  // 求人内容
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("求人内容:", 20, 45)

  // 長いテキストを複数行に分割
  const jobDescriptionLines = doc.splitTextToSize(result.jobDescription, 170)
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(jobDescriptionLines, 20, 55, { maxWidth: 170 })

  // 安全性評価
  const yPos = 55 + jobDescriptionLines.length * 5 + 10
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("安全性評価:", 20, yPos)

  // 安全性ステータス
  const analysisResult = result.analysisResult
  doc.setFontSize(12)
  if (analysisResult.isSafe) {
    doc.setTextColor(0, 150, 0)
    doc.text("✓ 安全な正規バイト", 20, yPos + 10)
  } else {
    doc.setTextColor(200, 0, 0)
    doc.text("⚠ 危険な闇バイトの可能性", 20, yPos + 10)
  }

  // 安全性スコア
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`安全性スコア: ${analysisResult.safetyScore}%`, 20, yPos + 20)
  doc.text(`分析確信度: ${analysisResult.confidenceLevel}%`, 20, yPos + 30)

  // 危険シグナル
  doc.setFontSize(14)
  doc.text("検出された危険シグナル:", 20, yPos + 45)

  const redFlags = Object.entries(analysisResult.redFlags)
  let redFlagYPos = yPos + 55

  redFlags.forEach(([key, value]) => {
    doc.setFontSize(10)
    if (value) {
      doc.setTextColor(200, 0, 0)
      doc.text(`⚠ ${formatFlagKey(key)}`, 25, redFlagYPos)
    } else {
      doc.setTextColor(0, 150, 0)
      doc.text(`✓ ${formatFlagKey(key)}`, 25, redFlagYPos)
    }
    redFlagYPos += 8
  })

  // 警告フラグ
  if (analysisResult.warningFlags.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("警告フラグ:", 20, redFlagYPos + 10)

    let warningYPos = redFlagYPos + 20
    analysisResult.warningFlags.forEach((warning, index) => {
      doc.setFontSize(10)
      doc.setTextColor(200, 100, 0)
      const warningLines = doc.splitTextToSize(`• ${warning}`, 160)
      doc.text(warningLines, 25, warningYPos)
      warningYPos += warningLines.length * 5 + 3
    })

    redFlagYPos = warningYPos
  }

  // 新しいページが必要かチェック
  if (redFlagYPos > 250) {
    doc.addPage()
    redFlagYPos = 20
  }

  // 安全性分析
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("詳細分析:", 20, redFlagYPos + 10)

  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  const analysisLines = doc.splitTextToSize(analysisResult.safetyAnalysis, 170)
  doc.text(analysisLines, 20, redFlagYPos + 20, { maxWidth: 170 })

  let currentYPos = redFlagYPos + 20 + analysisLines.length * 5 + 5

  // 新しいページが必要かチェック
  if (currentYPos > 250) {
    doc.addPage()
    currentYPos = 20
  }

  // 推奨される行動
  if (analysisResult.recommendedActions.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("推奨される行動:", 20, currentYPos + 10)

    let actionYPos = currentYPos + 20
    analysisResult.recommendedActions.forEach((action, index) => {
      doc.setFontSize(10)
      doc.setTextColor(0, 100, 150)
      const actionLines = doc.splitTextToSize(`${index + 1}. ${action}`, 160)
      doc.text(actionLines, 25, actionYPos)
      actionYPos += actionLines.length * 5 + 3
    })

    currentYPos = actionYPos
  }

  // 新しいページが必要かチェック
  if (currentYPos > 250) {
    doc.addPage()
    currentYPos = 20
  }

  // 代替求人の提案
  if (analysisResult.alternativeJobSuggestions.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("代替求人の提案:", 20, currentYPos + 10)

    let suggestionYPos = currentYPos + 20
    analysisResult.alternativeJobSuggestions.forEach((suggestion, index) => {
      doc.setFontSize(10)
      doc.setTextColor(0, 150, 50)
      const suggestionLines = doc.splitTextToSize(`${index + 1}. ${suggestion}`, 160)
      doc.text(suggestionLines, 25, suggestionYPos)
      suggestionYPos += suggestionLines.length * 5 + 3
    })
  }

  // フッター
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("このレポートはAIによる自動分析結果です。実際の求人応募の際は十分にご注意ください。", 105, 285, {
      align: "center",
    })
    doc.text(`${i} / ${pageCount}`, 190, 285, { align: "right" })
  }

  // PDFをデータURLとして返す
  return doc.output("dataurlstring")
}

// 危険シグナルのキーをフォーマットする関数
function formatFlagKey(key: string): string {
  const translations: { [key: string]: string } = {
    unrealisticPay: "非現実的な高額報酬",
    lackOfCompanyInfo: "会社情報の欠如",
    requestForPersonalInfo: "個人情報の不審な要求",
    unclearJobDescription: "曖昧な仕事内容",
    illegalActivity: "違法行為の示唆",
  }
  return translations[key] || key
}
