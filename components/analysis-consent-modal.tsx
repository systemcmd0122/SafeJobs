"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Save, BarChart, Share2, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AnalysisConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConsent: (consent: boolean) => void
}

export function AnalysisConsentModal({ open, onOpenChange, onConsent }: AnalysisConsentModalProps) {
  const [saveConsent, setSaveConsent] = useState(true)
  const [contentHeight, setContentHeight] = useState(0)

  // 画面サイズに応じてコンテンツの高さを計算
  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window !== "undefined") {
        // 画面の高さの60%を最大高さとする（ヘッダーとフッターのスペースを考慮）
        const maxHeight = window.innerHeight * 0.6 - 200 // ヘッダー・フッター用に200px引く
        setContentHeight(maxHeight)
      }
    }

    calculateHeight()
    window.addEventListener("resize", calculateHeight)
    return () => window.removeEventListener("resize", calculateHeight)
  }, [])

  // モーダルが開かれたときにデフォルト値をリセット
  useEffect(() => {
    if (open) {
      setSaveConsent(true)
    }
  }, [open])

  const handleConfirm = () => {
    onConsent(saveConsent)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onConsent(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="h-5 w-5 text-primary" />
            解析結果の保存について
          </DialogTitle>
          <DialogDescription>解析結果を履歴として保存するかどうかをお選びください。</DialogDescription>
        </DialogHeader>

        <ScrollArea className="pr-4 mt-2" style={{ height: `${contentHeight}px` }}>
          <div className="space-y-4 text-sm pb-2">
            <section>
              <h3 className="font-medium text-base mb-2">履歴保存の目的</h3>
              <p>解析結果を履歴として保存することで、以下のメリットがあります：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>過去の解析結果を後から参照できます</li>
                <li>複数の求人を比較検討できます</li>
                <li>時間をかけて詳細な分析結果を確認できます</li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-base mb-2">データの利用方法</h3>
              <p>保存された解析結果は以下の目的で利用されます：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li className="flex items-start gap-2">
                  <Save className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>あなたの履歴として保存され、後から参照できるようになります</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>統計情報として集計され、サービスの品質向上に役立てられます</span>
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                  <span>AIモデルの学習データとして利用され、分析精度の向上に貢献します</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-base mb-2">プライバシーについて</h3>
              <p>保存されるデータには以下の情報が含まれます：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>入力された求人内容</li>
                <li>解析結果（安全性スコア、危険シグナルなど）</li>
                <li>解析日時</li>
              </ul>
              <p className="mt-2">
                個人を特定できる情報は収集しませんが、入力された求人情報に個人情報が含まれる場合は、その部分も保存される可能性があります。
              </p>
            </section>

            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-amber-800">
                  <p className="font-medium">注意事項</p>
                  <p className="text-sm mt-1">
                    履歴を保存しない場合でも、現在の解析結果は表示されますが、ブラウザを閉じると失われます。
                    また、履歴を保存しない場合でも、サービス改善のために匿名化された統計情報は収集される場合があります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Switch id="save-consent" checked={saveConsent} onCheckedChange={setSaveConsent} />
              <Label htmlFor="save-consent" className="font-medium">
                解析結果を履歴として保存する
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">{saveConsent ? "保存します" : "保存しません"}</span>
          </div>

          <DialogFooter>
            <div className="w-full flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel} className="sm:order-1 order-2">
                キャンセル
              </Button>
              <Button onClick={handleConfirm} className="sm:order-2 order-1">
                確認
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
