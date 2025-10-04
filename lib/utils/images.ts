/**
 * Image utility functions for constructing clean, branded URLs
 * Supports relative path storage for provider-agnostic architecture
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const STORAGE_BASE_URL = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/uploads` : ""

/**
 * Constructs full image URL from relative path
 * @param path - Relative path stored in database (e.g., "events/image.jpg" or "profiles/avatar.jpg")
 * @returns Full URL (e.g., "https://[project].supabase.co/storage/v1/object/public/uploads/events/image.jpg")
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/aulona-bookings-placeholder.webp"
  }

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const fullUrl = `${STORAGE_BASE_URL}/${path}`
  return fullUrl
}

/**
 * Extracts relative path from full URL
 * @param url - Full URL or relative path
 * @returns Relative path (e.g., "events/image.jpg" or "profiles/avatar.jpg")
 */
export function getRelativePath(url: string): string {
  if (!url) return ""

  // If it's already a relative path, return as is
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url
  }

  // Extract path from URL
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    // Remove leading slash and any storage path prefixes
    return pathname
      .replace(/^\//, "")
      .replace(/^storage\/v1\/object\/public\/event-images\//, "")
      .replace(/^storage\/v1\/object\/public\/uploads\//, "")
      .replace(/^events\//, "events/")
      .replace(/^profiles\//, "profiles/")
  } catch {
    return url
  }
}
