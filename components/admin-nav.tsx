"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Settings, LogOut, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getImageUrl } from "@/lib/utils/images"
import { useSettingsModal } from "@/contexts/settings-modal-context"

interface AdminNavProps {
  adminName: string
  adminRole: string
  pageTitle: string
  newBookingsCount?: number
  showNameAndRole?: boolean
  profileImage?: string | null
}

export function AdminNav({
  adminName,
  adminRole,
  pageTitle,
  newBookingsCount = 0,
  showNameAndRole = false,
  profileImage = null,
}: AdminNavProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const router = useRouter()
  const { openModal } = useSettingsModal()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const getInitial = () => {
    return adminName.charAt(0).toUpperCase()
  }

  return (
    <div className="bg-white h-24 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {newBookingsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {newBookingsCount > 9 ? "9+" : newBookingsCount}
            </span>
          )}
        </Link>
        <button onClick={openModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#AD8853] flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={getImageUrl(profileImage) || "/placeholder.svg"}
                  alt={adminName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">{getInitial()}</span>
              )}
            </div>
            {showNameAndRole && (
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">{adminRole}</p>
              </div>
            )}
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
