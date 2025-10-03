"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Settings, User, LogOut, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AdminNavProps {
  adminName: string
  adminRole: string
  pageTitle: string
  newBookingsCount?: number
}

export function AdminNav({ adminName, adminRole, pageTitle, newBookingsCount = 0 }: AdminNavProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="bg-white rounded-2xl h-24 px-6 flex items-center justify-between shadow-sm mb-6">
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
        <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#AD8853] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">{adminRole}</p>
            </div>
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
