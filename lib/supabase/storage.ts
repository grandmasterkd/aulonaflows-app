import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface UploadResult {
  relativePath: string
  error?: string
}

/**
 * Gets a unique filename by checking existing files in the database
 * and appending (1), (2), etc. if duplicates exist
 */
export async function getUniqueFilename(originalFilename: string, supabase: any): Promise<string> {
  // Extract name and extension
  const lastDotIndex = originalFilename.lastIndexOf(".")
  const name = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename
  const ext = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : ""

  // Check if this filename already exists in the database
  const { data: existingEvents } = await supabase
    .from("events")
    .select("image_url")
    .like("image_url", `%${name}%${ext}`)

  if (!existingEvents || existingEvents.length === 0) {
    return originalFilename
  }

  // Extract all existing filenames
  const existingFilenames = existingEvents
    .map((event: any) => {
      const url = event.image_url
      const filename = url.split("/").pop()
      return filename
    })
    .filter(Boolean)

  // If original doesn't exist, use it
  if (!existingFilenames.includes(originalFilename)) {
    return originalFilename
  }

  // Find the next available number
  let counter = 1
  let newFilename = `${name}(${counter})${ext}`

  while (existingFilenames.includes(newFilename)) {
    counter++
    newFilename = `${name}(${counter})${ext}`
  }

  return newFilename
}

/**
 * Uploads an image to Supabase Storage
 * Returns the relative path for database storage
 */
export async function uploadImage(file: File, folder: "events" | "profiles" = "events"): Promise<UploadResult> {
  try {
    const supabase = createBrowserClient()

    // Get unique filename
    const uniqueFilename = await getUniqueFilename(file.name, supabase)

    const filePath = `${folder}/${uniqueFilename}`
    const { data, error } = await supabase.storage.from("uploads").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return { relativePath: "", error: error.message }
    }

    return {
      relativePath: data.path,
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { relativePath: "", error: error.message || "Upload failed" }
  }
}
