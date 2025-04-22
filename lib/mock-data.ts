import type { AnalysisResult } from "@/types/analysis"

// 共通の履歴データ
export const mockAnalysisResults: AnalysisResult[] = [
  {
    id: "1",
    timestamp: "2025-03-25T10:30:00Z",
    jobDescription:
      "都内オフィスでの一般事務のアルバイトです。時給1,200円、交通費支給。勤務時間は平日10時〜17時。書類整理やデータ入力が主な業務です。社会保険完備、研修制度あり。正社員登用制度もあります。",
    analysisResult: {
      isSafe: true,
      safetyScore: 95,
      warningFlags: [],
      reasonsForConcern: [],
      legalIssues: [],
      redFlags: {
        unrealisticPay: false,
        lackOfCompanyInfo: false,
        requestForPersonalInfo: false,
        unclearJobDescription: false,
        illegalActivity: false,
      },
      safetyAnalysis:
        "この求人は安全な正規のアルバイトと判断されます。時給1,200円は都内の一般事務の相場として適切な範囲内です。勤務時間や業務内容が明確に記載されており、社会保険完備や研修制度、正社員登用制度などの福利厚生も提示されています。企業側の情報開示も適切で、労働条件も明確です。特に懸念される点は見当たりません。",
      recommendedActions: [
        "応募前に企業の公式サイトを確認する",
        "面接時に具体的な業務内容や勤務条件を確認する",
        "労働契約書の内容をしっかり確認する",
      ],
      alternativeJobSuggestions: [],
      confidenceLevel: 95,
    },
    filename: "safe-office-job",
  },
  {
    id: "2",
    timestamp: "2025-03-24T15:45:00Z",
    jobDescription:
      "簡単作業で日給3万円保証！ノルマなし、即日払いOK。身分証のみで即採用。内容は当日説明します。LINE登録で詳細をお伝えします。学生・フリーター大歓迎！シフト自由！",
    analysisResult: {
      isSafe: false,
      safetyScore: 20,
      warningFlags: [
        "非現実的に高い報酬が提示されています",
        "仕事内容が明確に説明されていません",
        "応募前にLINE登録を求めています",
        "身分証のみで即採用という不自然な採用プロセス",
      ],
      reasonsForConcern: [
        "日給3万円という高額報酬は一般的なアルバイトとしては非現実的",
        "仕事内容が事前に説明されず、「当日説明」とされている",
        "公式の採用プロセスではなくLINE登録を求めている",
        "身分証のみで即採用という不自然な採用方法",
      ],
      legalIssues: [
        "労働基準法に基づく労働条件の明示義務に違反している可能性",
        "適切な雇用契約を結ばない「闇バイト」の可能性",
      ],
      redFlags: {
        unrealisticPay: true,
        lackOfCompanyInfo: true,
        requestForPersonalInfo: true,
        unclearJobDescription: true,
        illegalActivity: false,
      },
      safetyAnalysis:
        "この求人は複数の危険信号を示しており、闇バイトである可能性が高いです。日給3万円という報酬は一般的なアルバイトとしては非常に高額で、通常の労働では得られない水準です。また、仕事内容が事前に明示されておらず「当日説明」とされている点は、労働基準法で義務付けられている労働条件明示義務に違反している可能性があります。さらに、公式の採用プロセスではなくLINE登録を求め、身分証のみで即採用するという点も不自然です。これらの特徴は、違法な活動や搾取的な労働環境に関連する「闇バイト」の典型的な特徴と一致します。",
      recommendedActions: [
        "この求人には応募しないことを強く推奨します",
        "同様の求人を見つけた場合は労働基準監督署に報告することを検討してください",
        "安全な求人を探すには公式の求人サイトや人材紹介会社を利用してください",
      ],
      alternativeJobSuggestions: [
        "公式の求人サイト（ハローワーク、リクナビなど）で同様の職種を探す",
        "信頼できる人材派遣会社に登録する",
        "大手企業の公式サイトの採用ページを確認する",
      ],
      confidenceLevel: 90,
    },
    filename: "suspicious-high-pay-job",
  },
  {
    id: "3",
    timestamp: "2025-03-23T20:15:00Z",
    jobDescription:
      "夜のお客様と会話するだけの簡単なお仕事。時給5000円以上可能。容姿に自信のある方優遇。身バレ防止対策あり。ノンアダルト・ノンタッチ。即日勤務可能。出勤自由。",
    analysisResult: {
      isSafe: false,
      safetyScore: 5,
      warningFlags: [
        "非現実的に高い時給が提示されています",
        "「身バレ防止」「ノンアダルト」などの不審な表現が使用されています",
        "「容姿に自信のある方優遇」という採用基準は不適切です",
        "「夜のお客様」という曖昧な表現が使用されています",
      ],
      reasonsForConcern: [
        "時給5000円以上という非現実的な高額報酬",
        "「身バレ防止」という表現は違法または社会的に問題のある活動を示唆",
        "「ノンアダルト・ノンタッチ」という表現は、実際には性的なサービスが期待されている可能性",
        "「容姿」による採用基準は差別的で不適切",
      ],
      legalIssues: [
        "風営法（風俗営業等の規制及び業務の適正化等に関する法律）に違反している可能性",
        "労働基準法違反の可能性",
        "売春防止法に抵触する可能性",
      ],
      redFlags: {
        unrealisticPay: true,
        lackOfCompanyInfo: true,
        requestForPersonalInfo: false,
        unclearJobDescription: true,
        illegalActivity: true,
      },
      safetyAnalysis:
        "この求人は明らかに危険な「闇バイト」の特徴を多く示しています。時給5000円という非現実的な高額報酬、「身バレ防止」「ノンアダルト・ノンタッチ」などの不審な表現、「容姿に自信のある方優遇」という不適切な採用基準、「夜のお客様」という曖昧な表現など、多くの危険信号が含まれています。これらの特徴は、風俗関連の違法な営業活動や、表向きは会話だけと謳いながら実際には性的なサービスが期待されている可能性を強く示唆しています。また、「身バレ防止」という表現は、この仕事が社会的に問題があるか違法である可能性を示しています。このような求人は、労働者の安全や権利が守られない環境で、法的リスクや個人的なリスクが非常に高いと考えられます。",
      recommendedActions: [
        "この求人には絶対に応募しないでください",
        "同様の求人を見つけた場合は警察や労働基準監督署に報告することを検討してください",
        "安全な求人を探すには公式の求人サイトや人材紹介会社を利用してください",
      ],
      alternativeJobSuggestions: [
        "公式の求人サイト（ハローワーク、リクナビなど）で安全な夜間勤務の仕事を探す",
        "コールセンターやホテルのフロントなど、正規の夜間勤務の仕事を検討する",
        "飲食店やコンビニエンスストアなどの深夜勤務の求人を探す",
      ],
      confidenceLevel: 98,
    },
    filename: "dangerous-night-job",
  },
]
