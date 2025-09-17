import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
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

  const getCustomerName = (notes: string) => {
    try {
      const customerData = JSON.parse(notes)
      return customerData.name || "N/A"
    } catch {
      return "N/A"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>

      {/* Table Header with Search */}
      <div className="brand-bg-beige/40 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Bookings</h2>
          <Input placeholder="Search bookings..." className="max-w-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="brand-bg-beige rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="brand-bg-beige">
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
            {bookings?.map((booking) => (
              <TableRow key={booking.id} className="bg-white">
                <TableCell className="font-mono text-sm">{booking.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">{getCustomerName(booking.notes)}</TableCell>
                <TableCell>{formatDate(booking.booking_date)}</TableCell>
                <TableCell>{booking.events?.name}</TableCell>
                <TableCell>
                  <Badge className={getPaymentStatusColor(booking.payment_status)}>{booking.payment_status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
