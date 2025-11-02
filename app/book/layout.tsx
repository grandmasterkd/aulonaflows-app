import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book Classes · Aulona Flows",
  description: "Book your yoga classes, sound therapy sessions, and wellness events with Aulona Flows.",
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}