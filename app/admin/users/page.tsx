import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserWithProfile } from "@/lib/supabase/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AddAdminForm } from "@/components/add-admin-form"
import { AdminPagination } from "@/components/admin-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users . Aulona Flows",
  description: "Manage users and their roles.",
}

interface AdminUsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {

  const supabase = await createClient()

  const { user, profile } = await getUserWithProfile()

  if (!user || !profile) {
    redirect("/admin/login")
  }

  if (profile.role !== 'admin') {
    redirect("/admin/login")
  }

  const itemsPerPage = 10
  const currentPage = parseInt((searchParams.page as string) || '1')
  const offset = (currentPage - 1) * itemsPerPage

  // Fetch users with pagination
  const { data: profiles, error: profilesError, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1)

  console.log("profiles:", profiles, "count:", count)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  const users = profiles || []
  const totalItems = count || 0


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
                     <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                       {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
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

           <AdminPagination
             currentPage={currentPage}
             totalItems={totalItems}
             itemsPerPage={itemsPerPage}
           />
         </div>
       </main>
     </div>
   )
}