import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `event-${timestamp}-${randomString}.${fileExtension}`

    console.log("[v0] Uploading to Vercel Blob with filename:", uniqueFilename)

    const blob = await put(uniqueFilename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("[v0] Upload successful, blob URL:", blob.url)

    const brandedUrl = blob.url.replace(/https:\/\/[^/]+\.blob\.vercel-storage\.com/, "/uploads")

    console.log("[v0] Returning branded URL:", brandedUrl)

    return NextResponse.json({ url: brandedUrl })
  } catch (error) {
    console.error("[v0] Error uploading to Vercel Blob:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
