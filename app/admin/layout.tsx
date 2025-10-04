import type React from "react"
import { SettingsModalProvider } from "@/contexts/settings-modal-context"

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
