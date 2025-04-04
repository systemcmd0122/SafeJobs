import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>トップページに戻る</span>
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">利用ポリシー</h1>
        </div>

        <p className="text-muted-foreground">
          求人安全性分析ツールをご利用いただく前に、以下のポリシーをお読みください。
          本サービスを利用することで、これらのポリシーに同意したものとみなされます。
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. サービスの目的</h2>
          <p>
            求人安全性分析ツールは、求人情報の安全性を分析し、潜在的なリスクや危険性を検出することを目的としています。
            本ツールはAIを活用して分析を行いますが、その結果は参考情報であり、完全な安全性を保証するものではありません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. 分析データの取り扱い</h2>
          <p>
            本サービスに入力された求人情報および分析結果は、サービス品質向上のために保存・利用される場合があります。
            個人を特定できる情報は収集しませんが、入力された求人情報に個人情報が含まれる場合は、その部分も保存される可能性があります。
          </p>
          <p>収集したデータは以下の目的で利用されます：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>AIモデルの精度向上と学習</li>
            <li>サービスの改善と機能拡張</li>
            <li>統計情報の作成と分析</li>
            <li>新たな危険パターンの検出と対策</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. 分析結果の共有と開示</h2>
          <p>本サービスで生成された分析結果は、以下の目的で共有・開示される場合があります：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>サービスの改善と品質向上のための内部分析</li>
            <li>AIモデルの学習と精度向上</li>
            <li>統計情報としての集計と公開（個別の求人情報は特定されません）</li>
            <li>法的要請があった場合の関係機関への開示</li>
            <li>研究目的での匿名化データの利用</li>
          </ul>
          <p>
            ただし、ユーザーの個人情報や特定の求人情報が第三者に開示されることはありません。
            すべてのデータは匿名化された形で処理されます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. 免責事項</h2>
          <p>
            本サービスの分析結果は、AIによる自動判定であり、100%の正確性を保証するものではありません。
            分析結果に基づく判断や行動は、ユーザー自身の責任において行ってください。
            本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いません。
          </p>
          <p>特に以下の点にご注意ください：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>分析結果は参考情報であり、絶対的な判断基準ではありません</li>
            <li>求人の安全性は時間の経過や状況の変化により変わる可能性があります</li>
            <li>本ツールで検出できない新たな詐欺手法や危険パターンが存在する可能性があります</li>
            <li>実際の応募判断は複数の情報源を基に慎重に行ってください</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. 禁止事項</h2>
          <p>本サービスを以下の目的で使用することを禁止します：</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>違法行為や犯罪行為の計画・実行</li>
            <li>他者への嫌がらせや迷惑行為</li>
            <li>サービスの運営を妨害する行為</li>
            <li>大量のリクエストによるサーバー負荷の増大</li>
            <li>システムの脆弱性を探索する行為</li>
            <li>その他、社会通念上不適切と判断される行為</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. ポリシーの変更</h2>
          <p>
            本ポリシーは、予告なく変更される場合があります。
            変更後のポリシーは、本ページに掲載された時点で効力を生じるものとします。
            定期的に本ページをご確認いただくことをお勧めします。
          </p>
        </section>

        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="text-amber-800">
              <h3 className="font-medium text-lg">重要な注意事項</h3>
              <p className="mt-2">
                本ツールは闇バイトなどの危険な求人を検出するための参考ツールです。
                実際の応募判断は、公式サイトの確認や企業調査など、複数の情報源を基に慎重に行ってください。
                分析結果だけを根拠に判断することはお控えください。
              </p>
              <p className="mt-2">
                危険な求人を見つけた場合は、適切な機関（警察、消費者センターなど）への報告をご検討ください。
                また、友人や知人に情報を共有し、被害の拡大を防ぐことも重要です。
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 pb-8">
          <Link href="/">
            <Button>トップページに戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

