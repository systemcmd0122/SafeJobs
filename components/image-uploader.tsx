"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, ImageIcon, FileText, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  onExtractedText: (text: string) => void
}

export function ImageUploader({ onExtractedText }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [recognitionMode, setRecognitionMode] = useState<string>("auto")
  const [tesseractLoaded, setTesseractLoaded] = useState(false)
  const [tesseract, setTesseract] = useState<any>(null)

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // クライアントサイドでのみ Tesseract.js をロード
  useEffect(() => {
    const loadTesseract = async () => {
      try {
        const { createWorker } = await import("tesseract.js")
        setTesseract({ createWorker })
        setTesseractLoaded(true)
      } catch (error) {
        console.error("Tesseract.js のロードに失敗しました:", error)
        setError("テキスト認識ライブラリのロードに失敗しました。ページを再読み込みしてください。")
      }
    }

    loadTesseract()
  }, [])

  // クライアント側で画像をリサイズする関数
  const resizeImage = (file: File, maxWidth = 1800, maxHeight = 1800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous" // CORS問題を回避
      img.onload = () => {
        // 画像が十分小さい場合はリサイズしない
        if (img.width <= maxWidth && img.height <= maxHeight) {
          resolve(file)
          return
        }

        // リサイズ比率を計算
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
        const width = Math.floor(img.width * ratio)
        const height = Math.floor(img.height * ratio)

        // キャンバスを使用して画像をリサイズ
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context not available"))
          return
        }

        // 画像の前処理（コントラスト強調など）
        ctx.filter = "contrast(1.2) brightness(1.1)" // OCR精度向上のための前処理
        ctx.drawImage(img, 0, 0, width, height)

        // リサイズした画像をBlobに変換
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"))
            return
          }
          // 新しいFileオブジェクトを作成
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        }, file.type)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // ファイルサイズの検証（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        setError("ファイルサイズは10MB以下にしてください")
        return
      }

      // ファイル形式の検証
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        setError("JPG、PNG、WEBP、GIF形式の画像のみアップロードできます")
        return
      }

      try {
        // クライアント側で画像をリサイズ
        const resizedFile = await resizeImage(file)
        setSelectedImage(resizedFile)
        setPreviewUrl(URL.createObjectURL(resizedFile))
        setError(null)
        setExtractedText(null)
        setConfidence(0)
        setProgress(0)
      } catch (error) {
        console.error("画像リサイズエラー:", error)
        setError("画像の処理中にエラーが発生しました")
      }
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      // ファイルサイズの検証（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        setError("ファイルサイズは10MB以下にしてください")
        return
      }

      // ファイル形式の検証
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        setError("JPG、PNG、WEBP、GIF形式の画像のみアップロードできます")
        return
      }

      try {
        // クライアント側で画像をリサイズ
        const resizedFile = await resizeImage(file)
        setSelectedImage(resizedFile)
        setPreviewUrl(URL.createObjectURL(resizedFile))
        setError(null)
        setExtractedText(null)
        setConfidence(0)
        setProgress(0)
      } catch (error) {
        console.error("画像リサイズエラー:", error)
        setError("画像の処理中にエラーが発生しました")
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setExtractedText(null)
    setConfidence(0)
    setProgress(0)
    setError(null)
    setZoom(1)
    setRotation(0)

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // クライアントサイドでOCR処理を実行する関数
  const performClientSideOCR = async (imageData: string) => {
    if (!tesseract || !tesseractLoaded) {
      throw new Error("Tesseract.js がロードされていません")
    }

    // 認識モードに基づいて言語を設定
    let languages: string
    switch (recognitionMode) {
      case "japanese":
        languages = "jpn"
        break
      case "latin":
        languages = "eng"
        break
      case "auto":
      default:
        languages = "jpn+eng"
        break
    }

    // Tesseract.js ワーカーを作成
    const worker = await tesseract.createWorker(languages)

    try {
      // OCR処理を実行
      const result = await worker.recognize(imageData)

      // 結果を処理
      let text = result.data.text

      // 認識モードに応じて後処理
      if (recognitionMode === "latin") {
        // ラテン文字以外の文字を除去
        text = text.replace(/[^\x00-\x7F]/g, "").trim()
      }

      // ワーカーを終了
      await worker.terminate()

      return {
        text: text,
        confidence: result.data.confidence,
      }
    } catch (error) {
      // エラー発生時はワーカーを終了
      await worker.terminate()
      throw error
    }
  }

  const handleExtractText = async () => {
    if (!selectedImage || !tesseractLoaded) return

    try {
      setIsProcessing(true)
      setError(null)
      setProgress(10)

      // 画像をBase64形式に変換
      const reader = new FileReader()

      reader.onloadend = async () => {
        try {
          const imageData = reader.result as string
          setProgress(30)

          // クライアントサイドでOCR処理を実行
          setProgress(50)
          const result = await performClientSideOCR(imageData)
          setProgress(90)

          if (result.text) {
            setExtractedText(result.text)
            setConfidence(result.confidence || 0)
            onExtractedText(result.text) // 親コンポーネントに抽出したテキストを渡す
          } else {
            setError("テキストを抽出できませんでした。別の画像を試してください。")
          }

          setProgress(100)
        } catch (error) {
          console.error("テキスト抽出エラー:", error)
          setError(error instanceof Error ? error.message : "テキスト抽出中にエラーが発生しました")
        } finally {
          setIsProcessing(false)
          // 少し遅延させてからプログレスバーをリセット
          setTimeout(() => {
            setProgress(0)
          }, 1000)
        }
      }

      reader.onerror = () => {
        setError("画像の読み込みに失敗しました")
        setIsProcessing(false)
        setProgress(0)
      }

      reader.readAsDataURL(selectedImage)
    } catch (error) {
      console.error("テキスト抽出エラー:", error)
      setError(error instanceof Error ? error.message : "テキスト抽出中にエラーが発生しました")
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">画像からテキストを抽出</h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>処理中...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="recognition-mode" className="text-sm font-medium mb-2 block">
            認識モード
          </Label>
          <Select value={recognitionMode} onValueChange={setRecognitionMode}>
            <SelectTrigger id="recognition-mode" className="w-full">
              <SelectValue placeholder="認識モードを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">自動検出（日本語・ローマ字）</SelectItem>
              <SelectItem value="japanese">日本語優先</SelectItem>
              <SelectItem value="latin">ローマ字優先</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            画像内の文字タイプに合わせて最適なモードを選択してください
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center mb-4 ${
            previewUrl ? "border-primary" : "border-gray-300 hover:border-gray-400"
          } transition-colors`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {previewUrl ? (
            <div className="relative">
              <div className="flex justify-center mb-2">
                <div className="relative overflow-hidden rounded-lg max-h-[400px]">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="プレビュー"
                    className="max-w-full object-contain transition-transform"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      maxHeight: "400px",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={zoomIn} title="拡大">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomOut} title="縮小">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={rotate} title="回転">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearImage} title="クリア">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {selectedImage?.name} ({(selectedImage?.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="flex justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                画像をドラッグ＆ドロップするか、クリックしてアップロード
              </p>
              <p className="text-xs text-muted-foreground">対応形式: JPG, PNG, WEBP, GIF (最大10MB)</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            id="image-upload"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isProcessing}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            画像を選択
          </Button>
          <Button
            onClick={handleExtractText}
            disabled={!selectedImage || isProcessing || !tesseractLoaded}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                処理中...
              </>
            ) : !tesseractLoaded ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ライブラリ読込中...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                テキストを抽出
              </>
            )}
          </Button>
        </div>

        {extractedText && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">抽出されたテキスト</h4>
              <span className="text-xs text-muted-foreground">信頼度: {confidence.toFixed(1)}%</span>
            </div>
            <div className="bg-muted p-3 rounded-md text-sm max-h-[200px] overflow-y-auto">{extractedText}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
