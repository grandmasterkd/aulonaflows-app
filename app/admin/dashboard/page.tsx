import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Fetch total revenue
  const { data: payments } = await supabase.from("payments").select("amount").eq("payment_status", "completed")

  const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  // Fetch total customers
  const { count: totalCustomers } = await supabase.from("clients").select("*", { count: "exact", head: true })

  // Fetch total bookings
  const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

  // Fetch bookings grouped by month for current year
  const currentYear = new Date().getFullYear()
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("booking_date")
    .gte("booking_date", `${currentYear}-01-01`)
    .lte("booking_date", `${currentYear}-12-31`)

  // Process bookings by month
  const monthlyBookings = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i).toLocaleDateString("en-US", { month: "short" }),
    bookings: 0,
  }))

  bookingsData?.forEach((booking) => {
    const month = new Date(booking.booking_date).getMonth()
    monthlyBookings[month].bookings++
  })

  // Fetch monthly data for pie chart (current month)
  const currentMonth = new Date().getMonth()
  const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString()
  const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString()

  const { count: monthlyBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("booking_date", currentMonthStart)
    .lte("booking_date", currentMonthEnd)

  const { data: monthlyPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("payment_status", "completed")
    .gte("date", currentMonthStart)
    .lte("date", currentMonthEnd)

  const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  const { count: monthlyClientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .gte("date_joined", currentMonthStart)
    .lte("date_joined", currentMonthEnd)

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("date_time", new Date().toISOString())
    .eq("status", "active")
    .order("date_time", { ascending: true })
    .limit(6)

  // Fetch recent bookings with client info
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      clients(name),
      events(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: newBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo)

  const adminName = user.user_metadata?.first_name || user.email?.split("@")[0] || "Admin"
  const adminRole = user.user_metadata?.role || "Administrator"

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <DashboardContent
          adminName={adminName}
          adminRole={adminRole}
          totalRevenue={totalRevenue}
          totalCustomers={totalCustomers || 0}
          totalBookings={totalBookings || 0}
          monthlyBookings={monthlyBookings}
          currentYear={currentYear}
          monthlyData={{
            bookings: monthlyBookingsCount || 0,
            revenue: monthlyRevenue,
            clients: monthlyClientsCount || 0,
          }}
          upcomingEvents={upcomingEvents || []}
          recentBookings={recentBookings || []}
          newBookingsCount={newBookingsCount || 0}
        />
      </main>
    </div>
  )
}
