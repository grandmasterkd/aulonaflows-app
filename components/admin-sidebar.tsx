"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LayoutDashboard, Calendar, CalendarDays, Users, CreditCard, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const sidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Events", href: "/admin/events", icon: CalendarDays },
  { title: "Clients", href: "/admin/clients", icon: Users },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-transparent"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 brand-bg-beige transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#57463B]/20">
            <div className="flex items-center gap-3">
             <Image src="/aulonaflows-logo-white.svg" alt="AulonaFlows Logo" width={50} height={50} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "brand-bg-brown brand-text-cream"
                      : "text-[#57463B] hover:bg-[#57463B]/10 hover:text-[#57463B]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#57463B]/20">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-[#57463B] hover:bg-[#57463B]/10 hover:text-[#57463B]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}
