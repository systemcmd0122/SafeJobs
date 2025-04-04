"use client"

import { useEffect, useState, useRef } from "react"
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
import { Shield, AlertTriangle } from "lucide-react"

export function PolicyConsentModal() {
  const [open, setOpen] = useState(false)
  const [hasConsented, setHasConsented] = useState(true) // デフォルトはtrueにして、useEffectで確認
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // 画面サイズに応じてコンテンツの高さを計算
  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window !== "undefined") {
        // 画面の高さの80%を最大高さとする（ヘッダーとフッターのスペースを考慮）
        const maxHeight = window.innerHeight * 0.8 - 200 // ヘッダー・フッター用に200px引く
        setContentHeight(maxHeight)
      }
    }

    calculateHeight()
    window.addEventListener("resize", calculateHeight)
    return () => window.removeEventListener("resize", calculateHeight)
  }, [])

  useEffect(() => {
    // ローカルストレージから同意状態を確認
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("policy-consent")
      if (consent !== "accepted") {
        setHasConsented(false)
        setOpen(true)
      }
    }
  }, [])

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("policy-consent", "accepted")
    }
    setHasConsented(true)
    setOpen(false)
  }

  // 同意していない場合はモーダルを表示
  if (hasConsented) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // 同意していない場合は閉じられないようにする
        if (hasConsented) {
          setOpen(newOpen)
        } else {
          // 閉じようとした場合は何もしない（強制的に開いたままにする）
          if (!newOpen) {
            return
          }
          setOpen(newOpen)
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[600px] w-[95vw] max-h-[90vh] flex flex-col"
        // 閉じるボタンを無効化
        showCloseButton={false}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            求人安全性分析ツール 利用ポリシー
          </DialogTitle>
          <DialogDescription>
            本サービスを利用する前に、以下のポリシーをお読みいただき、同意してください。
          </DialogDescription>
        </DialogHeader>

        <div ref={contentRef} className="flex-grow overflow-hidden">
          <ScrollArea className="pr-4 mt-2" style={{ height: `${contentHeight}px` }}>
            <div className="space-y-4 text-sm pb-2">
              <section>
                <h3 className="font-medium text-base mb-2">1. サービスの目的</h3>
                <p>
                  求人安全性分析ツールは、求人情報の安全性を分析し、潜在的なリスクや危険性を検出することを目的としています。
                  本ツールはAIを活用して分析を行いますが、その結果は参考情報であり、完全な安全性を保証するものではありません。
                </p>
              </section>

              <section>
                <h3 className="font-medium text-base mb-2">2. 分析データの取り扱い</h3>
                <p>
                  本サービスに入力された求人情報および分析結果は、サービス品質向上のために保存・利用される場合があります。
                  個人を特定できる情報は収集しませんが、入力された求人情報に個人情報が含まれる場合は、その部分も保存される可能性があります。
                </p>
              </section>

              <section>
                <h3 className="font-medium text-base mb-2">3. 分析結果の共有と開示</h3>
                <p>本サービスで生成された分析結果は、以下の目的で共有・開示される場合があります：</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>サービスの改善と品質向上のための内部分析</li>
                  <li>AIモデルの学習と精度向上</li>
                  <li>統計情報としての集計と公開（個別の求人情報は特定されません）</li>
                  <li>法的要請があった場合の関係機関への開示</li>
                </ul>
              </section>

              <section>
                <h3 className="font-medium text-base mb-2">4. 免責事項</h3>
                <p>
                  本サービスの分析結果は、AIによる自動判定であり、100%の正確性を保証するものではありません。
                  分析結果に基づく判断や行動は、ユーザー自身の責任において行ってください。
                  本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いません。
                </p>
              </section>

              <section>
                <h3 className="font-medium text-base mb-2">5. 禁止事項</h3>
                <p>本サービスを以下の目的で使用することを禁止します：</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>違法行為や犯罪行為の計画・実行</li>
                  <li>他者への嫌がらせや迷惑行為</li>
                  <li>サービスの運営を妨害する行為</li>
                  <li>その他、社会通念上不適切と判断される行為</li>
                </ul>
              </section>

              <section>
                <h3 className="font-medium text-base mb-2">6. ポリシーの変更</h3>
                <p>
                  本ポリシーは、予告なく変更される場合があります。
                  変更後のポリシーは、本ページに掲載された時点で効力を生じるものとします。
                  定期的に本ページをご確認いただくことをお勧めします。
                </p>
              </section>

              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-800">
                    <p className="font-medium">重要な注意事項</p>
                    <p className="text-sm mt-1">
                      本ツールは闇バイトなどの危険な求人を検出するための参考ツールです。
                      実際の応募判断は、公式サイトの確認や企業調査など、複数の情報源を基に慎重に行ってください。
                      分析結果だけを根拠に判断することはお控えください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <div className="w-full flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back()
                } else {
                  // 履歴がない場合は何もしない（モーダルは閉じない）
                  alert("このサイトを利用するには、利用ポリシーに同意する必要があります。")
                }
              }}
              className="sm:order-1 order-2"
            >
              同意しない（戻る）
            </Button>
            <Button onClick={handleAccept} className="sm:order-2 order-1">
              同意して続ける
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

