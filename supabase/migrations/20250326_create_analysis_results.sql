-- 分析結果を保存するテーブル
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  job_description TEXT NOT NULL,
  is_safe BOOLEAN NOT NULL,
  safety_score INTEGER NOT NULL,
  warning_flags JSONB,
  reasons_for_concern JSONB,
  legal_issues JSONB,
  red_flags JSONB NOT NULL,
  safety_analysis TEXT,
  recommended_actions JSONB,
  alternative_job_suggestions JSONB,
  confidence_level INTEGER NOT NULL
);

-- 分析結果の検索用インデックス
CREATE INDEX idx_analysis_results_created_at ON analysis_results(created_at);
CREATE INDEX idx_analysis_results_is_safe ON analysis_results(is_safe);
CREATE INDEX idx_analysis_results_safety_score ON analysis_results(safety_score);

-- 安全性スコアの範囲ごとの集計を取得するビュー
CREATE VIEW analysis_score_distribution AS
SELECT
  CASE
    WHEN safety_score BETWEEN 0 AND 20 THEN '0-20%'
    WHEN safety_score BETWEEN 21 AND 40 THEN '21-40%'
    WHEN safety_score BETWEEN 41 AND 60 THEN '41-60%'
    WHEN safety_score BETWEEN 61 AND 80 THEN '61-80%'
    WHEN safety_score BETWEEN 81 AND 100 THEN '81-100%'
  END AS score_range,
  COUNT(*) AS count
FROM analysis_results
GROUP BY score_range
ORDER BY score_range;

-- 月別分析件数を取得するビュー
CREATE VIEW analysis_monthly_counts AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS count
FROM analysis_results
GROUP BY month
ORDER BY month;

-- 危険シグナルの出現頻度を取得するビュー
CREATE VIEW red_flags_frequency AS
SELECT
  'unrealisticPay' AS flag_type,
  COUNT(*) FILTER (WHERE (red_flags->>'unrealisticPay')::boolean = true) AS count
FROM analysis_results
UNION ALL
SELECT
  'lackOfCompanyInfo' AS flag_type,
  COUNT(*) FILTER (WHERE (red_flags->>'lackOfCompanyInfo')::boolean = true) AS count
FROM analysis_results
UNION ALL
SELECT
  'requestForPersonalInfo' AS flag_type,
  COUNT(*) FILTER (WHERE (red_flags->>'requestForPersonalInfo')::boolean = true) AS count
FROM analysis_results
UNION ALL
SELECT
  'unclearJobDescription' AS flag_type,
  COUNT(*) FILTER (WHERE (red_flags->>'unclearJobDescription')::boolean = true) AS count
FROM analysis_results
UNION ALL
SELECT
  'illegalActivity' AS flag_type,
  COUNT(*) FILTER (WHERE (red_flags->>'illegalActivity')::boolean = true) AS count
FROM analysis_results;

-- 危険度別の分布を取得するビュー
CREATE VIEW risk_distribution AS
SELECT
  COUNT(*) FILTER (WHERE safety_score >= 80) AS safe_count,
  COUNT(*) FILTER (WHERE safety_score >= 40 AND safety_score < 80) AS warning_count,
  COUNT(*) FILTER (WHERE safety_score < 40) AS dangerous_count
FROM analysis_results;
