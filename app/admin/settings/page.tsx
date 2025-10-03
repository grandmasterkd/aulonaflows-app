import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SettingsContent } from "@/components/settings-content"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get new bookings count
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: newBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo)

  const adminName = profile ? `${profile.first_name} ${profile.last_name}` : "Admin"
  const adminRole = profile?.role || "admin"

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <SettingsContent
          adminName={adminName}
          adminRole={adminRole}
          newBookingsCount={newBookingsCount || 0}
          profile={profile}
        />
      </main>
    </div>
  )
}
