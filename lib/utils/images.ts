/**
 * Image utility functions for constructing clean, branded URLs
 * Supports relative path storage for provider-agnostic architecture
 */

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://media.aulonaflows.com"

/**
 * Constructs full image URL from relative path
 * @param path - Relative path stored in database (e.g., "events/image.jpg")
 * @returns Full URL (e.g., "https://media.aulonaflows.com/events/image.jpg")
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/aulona-bookings-placeholder.webp"
  }

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Construct clean URL from relative path
  return `${IMAGE_BASE_URL}/${path}`
}

/**
 * Extracts relative path from full URL
 * @param url - Full URL or relative path
 * @returns Relative path (e.g., "events/image.jpg")
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
      .replace(/^events\//, "events/")
  } catch {
    return url
  }
}
