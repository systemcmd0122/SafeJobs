import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // multipart/form-dataからファイルを取得
    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 })
    }

    // ファイルサイズの制限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは10MB以下にしてください" }, { status: 400 })
    }

    // 許可されるファイル形式
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "JPG、PNG、WEBP、GIF形式の画像のみアップロードできます" }, { status: 400 })
    }

    // ファイルをバッファに変換してBase64エンコード
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64Image}`

    // 画像データをクライアントに返す
    return NextResponse.json({
      success: true,
      imageData: dataUrl,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("OCR API エラー:", error)
    return NextResponse.json(
      { error: "画像処理に失敗しました", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false, // multipart/form-dataを処理するために必要
  },
}
