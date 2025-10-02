import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    const brandedUrl = blob.url.replace("https://public.blob.vercel-storage.com", "/uploads")

    return NextResponse.json({ url: brandedUrl })
  } catch (error) {
    console.error("[v0] Error uploading to Vercel Blob:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
