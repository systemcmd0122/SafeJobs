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

