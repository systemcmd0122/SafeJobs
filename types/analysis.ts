export interface AnalysisResult {
  id: string
  timestamp: string
  jobDescription: string
  analysisResult: {
    isSafe: boolean
    safetyScore: number
    warningFlags: string[]
    reasonsForConcern: string[]
    legalIssues: string[]
    redFlags: {
      unrealisticPay: boolean
      lackOfCompanyInfo: boolean
      requestForPersonalInfo: boolean
      unclearJobDescription: boolean
      illegalActivity: boolean
    }
    safetyAnalysis: string
    recommendedActions: string[]
    alternativeJobSuggestions: string[]
    confidenceLevel: number
  }
  filename: string
  savedToHistory?: boolean // 履歴に保存されたかどうかのフラグを追加
}

