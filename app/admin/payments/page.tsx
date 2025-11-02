"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminNav } from "@/components/admin-nav"
import Image from "next/image"

interface Payment {
  id: string
  name: string
  event: string
  created_at: string
  amount: number
  payment_method: string
  payment_status: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [adminName, setAdminName] = useState("")
  const [adminRole, setAdminRole] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [newBookingsCount, setNewBookingsCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchPayments()
    fetchNewBookingsCount()
  }, [])

  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const name = payment.name.toLowerCase()
      const event = payment.event.toLowerCase()
      const paymentId = payment.id.toLowerCase()
      const search = searchTerm.toLowerCase()

      return name.includes(search) || event.includes(search) || paymentId.includes(search)
    })
    setFilteredPayments(filtered)
  }, [searchTerm, payments])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (profile) {
      setAdminName(`${profile.first_name} ${profile.last_name}`)
      setAdminRole(profile.role)
      setProfileImage(profile.image_url)
    }
  }

  const fetchPayments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payments:", error)
    } else {
      setPayments(data || [])
      setFilteredPayments(data || [])
    }
    setIsLoading(false)
  }

  const fetchNewBookingsCount = async () => {
    const supabase = createClient()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo)

    setNewBookingsCount(count || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0">
          <AdminNav
            adminName={adminName}
            adminRole={adminRole}
            profileImage={profileImage}
            pageTitle="Payments"
            newBookingsCount={newBookingsCount}
          />
        <div className="p-6 md:p-8">
        

          <div className="space-y-6">
            <section>
              <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">All Payments</h2>
                  <Input
                    placeholder="Search payments..."
                    className="w-[250px] h-12 rounded-lg bg-white border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="brand-bg-beige">
                    <TableRow>
                      <TableHead className="text-[#57463B] font-semibold">Payment ID</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Event</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Date</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Amount</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Payment Method</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{payment.name}</TableCell>
                        <TableCell>{payment.event}</TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="font-semibold">£{payment.amount}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.payment_status)}>{payment.payment_status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
