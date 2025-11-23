"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getImageUrl } from "@/lib/utils/images"
import { useSettingsModal } from "@/contexts/settings-modal-context"
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  Camera,
  Package,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const sidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Events", href: "/admin/events", icon: CalendarDays },
  { title: "Event Bundles", href: "/admin/events/bundles", icon: Package },
  { title: "Clients", href: "/admin/clients", icon: Users },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Users", href: "/admin/users", icon: Shield },
]

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { isOpen: isSettingsModalOpen, openModal, closeModal } = useSettingsModal()
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Admin"
        const imageUrl = profile.image_url || ""

        setAdminName(fullName)
        setAdminEmail(profile.email || user.email || "")
        setProfileImage(imageUrl)
      } else if (error) {
        const emailName = user.email?.split("@")[0] || "Admin"
        setAdminName(emailName)
        setAdminEmail(user.email || "")
      }
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const getInitial = () => {
    return adminName.charAt(0).toUpperCase()
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-transparent"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 brand-bg-beige transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#57463B]/20">
            <div className="flex items-center gap-3">
             <Image src="/aulonaflows-logo-white.svg" alt="AulonaFlows Logo" width={50} height={50} />
            </div>
          </div>

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

          <div className="p-4 border-t border-[#57463B]/20">
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#57463B]/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#AD8853] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[#57463B] truncate">{adminName}</p>
                  <p className="text-xs text-[#57463B]/70 truncate">{adminEmail}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#57463B] transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      openModal()
                      setIsProfileDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
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
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeModal}
          adminName={adminName}
          adminEmail={adminEmail}
          profileImage={profileImage}
          onUpdate={fetchUserProfile}
        />
      )}
    </>
  )
}

function SettingsModal({
  isOpen,
  onClose,
  adminName,
  adminEmail,
  profileImage,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  adminName: string
  adminEmail: string
  profileImage: string
  onUpdate: () => void
}) {
  const [name, setName] = useState(adminName)
  const [email, setEmail] = useState(adminEmail)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(profileImage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchCurrentProfile()
    }
  }, [isOpen])

  const fetchCurrentProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Admin")
        setEmail(profile.email || user.email || "")
        setImagePreview(profile.image_url ? getImageUrl(profile.image_url) : "")
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        setIsLoading(false)
        return
      }

      let imageUrl = profileImage
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, imageFile)

        if (uploadError) {
          console.error("Image upload error:", uploadError)
          setError("Failed to upload image")
          setIsLoading(false)
          return
        } else {
          imageUrl = filePath
        }
      }

      const [firstName, ...lastNameParts] = name.split(" ")
      const lastName = lastNameParts.join(" ")

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
        setError("Failed to update profile")
        setIsLoading(false)
        return
      }

      if (password) {
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setIsLoading(false)
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        })

        if (passwordError) {
          console.error("Password update error:", passwordError)
          setError("Failed to update password")
          setIsLoading(false)
          return
        }

        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitial = () => {
    return name.charAt(0).toUpperCase()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:w-1/3">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#AD8853] flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl md:text-5xl font-semibold">{getInitial()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer z-10 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/90 transition-colors">
                  <Camera className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">Edit</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 h-14 border-none bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3C9A3] text-gray-500"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 h-14 border-none bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3C9A3]"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 h-14 border-none bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3C9A3]"
                  placeholder="Leave blank to keep current"
                />
              </div>

              {password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 h-14 border-none bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E3C9A3]"
                    required
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 h-14 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 h-14 bg-[#E3C9A3] text-black rounded-xl hover:bg-[#D4B896] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
