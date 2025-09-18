"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

interface Booking {
  id: string
  booking_date: string
  notes: string
  payment_status: string
  status: string
  events: {
    name: string
    date_time: string
  } | null
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchBookings()
  }, [])

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const customerName = getCustomerName(booking.notes).toLowerCase()
      const eventName = booking.events?.name?.toLowerCase() || ""
      const bookingId = booking.id.toLowerCase()
      const search = searchTerm.toLowerCase()

      return customerName.includes(search) || eventName.includes(search) || bookingId.includes(search)
    })
    setFilteredBookings(filtered)
  }, [searchTerm, bookings])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
    }
  }

  const fetchBookings = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          name,
          date_time
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bookings:", error)
    } else {
      setBookings(data || [])
      setFilteredBookings(data || [])
    }
    setIsLoading(false)
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
      case "confirmed":
        return "bg-green-100 text-green-800 h-8 rounded-lg"
      case "pending":
        return "bg-yellow-100 text-yellow-800 h-8 rounded-lg"
      case "cancelled":
        return "bg-red-100 text-red-800 h-8 rounded-lg"
      default:
        return "bg-gray-100 text-gray-800 h-8 rounded-lg"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 h-8 rounded-lg"
      case "pending":
        return "bg-[#FAE892] text-[#57463B] h-8 rounded-lg"
      case "failed":
        return "bg-red-100 text-red-800 h-8 rounded-lg"
      default:
        return "bg-gray-100 text-gray-800 h-8 rounded-lg"
    }
  }

  const getCustomerName = (notes: string) => {
    try {
      const customerData = JSON.parse(notes)
      return customerData.name || "N/A"
    } catch {
      return "N/A"
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
        <div className="p-6 md:p-8">
          <div className="space-y-6">
            <ArrowLeft className="size-6 text-gray-500" />

            <section>
              <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">All Bookings</h2>
                  <Input
                    placeholder="Search bookings..."
                    className="max-w-xs h-12 rounded-lg bg-white border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className=" overflow-hidden">
                <Table>
                  <TableHeader className="h-14 brand-bg-beige">
                    <TableRow>
                      <TableHead className="text-[#57463B] font-semibold">Booking ID</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Date</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Event</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Payment Status</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Booking Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="text-sm">{booking.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{getCustomerName(booking.notes)}</TableCell>
                        <TableCell>{formatDate(booking.booking_date)}</TableCell>
                        <TableCell>{booking.events?.name}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
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
