import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserWithProfile } from "@/lib/supabase/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AddAdminForm } from "@/components/add-admin-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users . Aulona Flows",
  description: "Manage users and their roles.",
}

export default async function AdminUsersPage() {

  const supabase = await createClient()

  const { user, profile } = await getUserWithProfile()

  if (!user || !profile) {
    redirect("/admin/login")
  }

  if (profile.role !== 'admin') {
    redirect("/admin/login")
  }

  // Fetch all users from both profiles and admins tables
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

    console.log("profile:",profiles)

  const { data: admins, error: adminsError } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  if (adminsError) {
    console.error('Error fetching admins:', adminsError)
  }

  // Combine and sort users
  const users = [...(profiles || []), ...(admins || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )


  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>

          <AddAdminForm />

          <div className="grid gap-4">
            {users?.map((userProfile) => (
              <Card key={userProfile.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {userProfile.first_name} {userProfile.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                    <Badge variant={userProfile.role === 'Admin' ? 'default' : 'secondary'}>
                      {userProfile.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>    
        </div>     
      </main>
    </div>
  )
}