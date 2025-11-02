import type React from "react"
import type { Metadata } from "next"
import { SettingsModalProvider } from "@/contexts/settings-modal-context"

export const metadata: Metadata = {
  title: "Admin · Aulona Flows",
  description: "Admin panel for Aulona Flows - manage your business operations.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SettingsModalProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </SettingsModalProvider>
  )
}
