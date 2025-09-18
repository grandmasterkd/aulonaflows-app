import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ArrowLeft } from "lucide-react"

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Get bookings with event details
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      events (
        name,
        date_time
      )
    `,
    )
    .order("created_at", { ascending: false })

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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8">
          <div className="space-y-6">
            <ArrowLeft className="size-6 text-gray-500" />
            {/* <h1 className="text-3xl font-bold text-gray-900">Bookings</h1> */}

            {/* Table Header with Search */}
           

            {/* Table */}
            <section>
            <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">All Bookings</h2>
                <Input placeholder="Search bookings..." className="max-w-xs h-12 rounded-lg bg-white border-none" />
              </div>
            </div>
            <div className=" overflow-hidden">
              <Table>
                <TableHeader className="h-14 brand-bg-beige">
                  <TableRow  >
                    <TableHead className="text-[#57463B] font-semibold">Booking ID</TableHead>
                    <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                    <TableHead className="text-[#57463B] font-semibold">Date</TableHead>
                    <TableHead className="text-[#57463B] font-semibold">Event</TableHead>
                    <TableHead className="text-[#57463B] font-semibold">Payment Status</TableHead>
                    <TableHead className="text-[#57463B] font-semibold">Booking Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.map((booking) => (
                    <TableRow key={booking.id} >
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
