export function validateAndCompleteData(data: any) {
  const defaultRedFlags = {
    unrealisticPay: false,
    lackOfCompanyInfo: false,
    requestForPersonalInfo: false,
    unclearJobDescription: false,
    illegalActivity: false,
  }

  if (typeof data.isSafe !== "boolean") data.isSafe = false
  if (typeof data.safetyScore !== "number") data.safetyScore = 0
  if (!Array.isArray(data.warningFlags)) data.warningFlags = []
  if (!Array.isArray(data.reasonsForConcern)) data.reasonsForConcern = []
  if (!Array.isArray(data.legalIssues)) data.legalIssues = []
  if (!data.redFlags || typeof data.redFlags !== "object") data.redFlags = defaultRedFlags
  if (!data.safetyAnalysis) data.safetyAnalysis = ""
  if (!Array.isArray(data.recommendedActions)) data.recommendedActions = []
  if (!Array.isArray(data.alternativeJobSuggestions)) data.alternativeJobSuggestions = []
  if (typeof data.confidenceLevel !== "number") data.confidenceLevel = 50

  // 値の範囲を正規化
  data.safetyScore = Math.max(0, Math.min(100, data.safetyScore))
  data.confidenceLevel = Math.max(0, Math.min(100, data.confidenceLevel))

  // redFlagsの各プロパティを確認
  for (const key in defaultRedFlags) {
    if (typeof data.redFlags[key] !== "boolean") {
      data.redFlags[key] = defaultRedFlags[key as keyof typeof defaultRedFlags]
    }
  }
}

// 解析結果の検証関数
export function validateAnalysisResult(result: any): boolean {
  if (!result) return false

  // 必須フィールドの存在確認
  if (!result.jobDescription || !result.analysisResult || !result.timestamp) {
    return false
  }

  // analysisResultの必須フィールド確認
  const analysisResult = result.analysisResult
  if (
    typeof analysisResult.isSafe !== "boolean" ||
    typeof analysisResult.safetyScore !== "number" ||
    !analysisResult.redFlags ||
    typeof analysisResult.safetyAnalysis !== "string" ||
    typeof analysisResult.confidenceLevel !== "number"
  ) {
    return false
  }

  // 配列フィールドの確認
  if (
    !Array.isArray(analysisResult.warningFlags) ||
    !Array.isArray(analysisResult.reasonsForConcern) ||
    !Array.isArray(analysisResult.legalIssues) ||
    !Array.isArray(analysisResult.recommendedActions) ||
    !Array.isArray(analysisResult.alternativeJobSuggestions)
  ) {
    return false
  }

  // redFlagsの確認
  const redFlags = analysisResult.redFlags
  const requiredRedFlags = [
    "unrealisticPay",
    "lackOfCompanyInfo",
    "requestForPersonalInfo",
    "unclearJobDescription",
    "illegalActivity",
  ]

  for (const flag of requiredRedFlags) {
    if (typeof redFlags[flag] !== "boolean") {
      return false
    }
  }

  return true
}
