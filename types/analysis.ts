export interface AnalysisResult {
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
}

