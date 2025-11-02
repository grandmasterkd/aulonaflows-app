import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Make an Enquiry · Aulona Flows",
  description: "Get in touch with Aulona Flows. Send us a message about our yoga classes, sound therapy, or wellness services.",
}

export default function EnquiryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}