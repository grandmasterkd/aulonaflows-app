import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ArrowLeft } from "lucide-react"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Get payments with booking and event details
  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      *,
      bookings (
        name,
        events (
          name
        )
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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8">
          <div className="space-y-6">
            <ArrowLeft className="size-6 text-gray-500" />
            {/* <h1 className="text-3xl font-bold text-gray-900">Payments</h1> */}

            {/* Table Header with Search */}
           

            {/* Table */}
            <section>
             <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">All Payments</h2>
                <Input placeholder="Search payments..." className="w-[250px] h-12 rounded-lg bg-white border-none" />
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
                  {payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{payment.bookings?.name}</TableCell>
                      <TableCell>{payment.bookings?.events?.name}</TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="font-semibold">£{payment.amount}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
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
