import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserWithProfile } from "@/lib/supabase/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import type { Metadata } from "next"

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: "Dashboard . Aulona Flows",
  description: "Admin dashboard for Aulona Flows - manage bookings, events, and clients.",
}

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()

  const { user, profile } = await getUserWithProfile()

  if (!user || !profile) {
    redirect("/admin/login")
  }

  // Get filter parameters from URL
  const selectedYear = parseInt((searchParams.year as string) || new Date().getFullYear().toString())
  const selectedMonth = parseInt((searchParams.month as string) || new Date().getMonth().toString())

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const selectedMonthStart = new Date(selectedYear, selectedMonth, 1).toISOString()
  const selectedMonthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString()
  const selectedYearStart = `${selectedYear}-01-01`
  const selectedYearEnd = `${selectedYear}-12-31`
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Run all queries in parallel for better performance
  const [
    { data: payments },
    { count: totalCustomers },
    { count: totalBookings },
    { data: bookingsData },
    { count: monthlyBookingsCount },
    { data: monthlyPayments },
    { count: monthlyClientsCount },
    { count: totalEvents },
    { data: upcomingEvents },
    { data: recentBookings },
    { count: newBookingsCount },
  ] = await Promise.all([
    // Total revenue for selected year
    supabase
      .from("payments")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("date", selectedYearStart)
      .lte("date", selectedYearEnd),
    // Total customers for selected year
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .gte("date_joined", selectedYearStart)
      .lte("date_joined", selectedYearEnd),
    // Total bookings for selected year
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("booking_date", selectedYearStart)
      .lte("booking_date", selectedYearEnd),
    // Bookings by month for selected year
    supabase
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", selectedYearStart)
      .lte("booking_date", selectedYearEnd),
    // Monthly bookings count for selected month
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("booking_date", selectedMonthStart)
      .lte("booking_date", selectedMonthEnd),
    // Monthly payments for selected month
    supabase
      .from("payments")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("date", selectedMonthStart)
      .lte("date", selectedMonthEnd),
    // Monthly clients for selected month
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .gte("date_joined", selectedMonthStart)
      .lte("date_joined", selectedMonthEnd),
    // Total events count
    supabase
      .from("events")
      .select("*", { count: "exact", head: true }),
    // Upcoming events
    supabase
      .from("events")
      .select("*")
      .gte("date_time", new Date().toISOString())
      .eq("status", "active")
      .order("date_time", { ascending: true })
      .limit(6),
     // Recent bookings (only paid ones)
     supabase
       .from("bookings")
       .select(`
         *,
         events(name)
       `)
       .eq("payment_status", "paid")
       .order("created_at", { ascending: false })
       .limit(5),
    // New bookings count
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo),
  ])

 
  

  // Process data
  const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  const monthlyBookings = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(currentYear, i).toLocaleDateString("en-US", { month: "short" }),
    bookings: 0,
  }))

  bookingsData?.forEach((booking) => {
    const month = new Date(booking.booking_date).getMonth()
    monthlyBookings[month].bookings++
  })


  const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  // Check if there's data for the selected month
  const hasMonthlyData = (monthlyBookingsCount || 0) > 0 || monthlyRevenue > 0 || (monthlyClientsCount || 0) > 0

  const adminName = `${profile.first_name} ${profile.last_name} 👋`
  const adminRole = profile.role
  const profileImage = profile.image_url

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <DashboardContent
          adminName={adminName}
          adminRole={adminRole}
          profileImage={profileImage}
          totalRevenue={totalRevenue}
          totalCustomers={totalCustomers || 0}
          totalBookings={totalBookings || 0}
          monthlyBookings={monthlyBookings}
          currentYear={currentYear}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthlyData={{
            events: totalEvents || 0,
            bookings: monthlyBookingsCount || 0,
            revenue: monthlyRevenue,
            clients: monthlyClientsCount || 0,
          }}
          hasMonthlyData={hasMonthlyData}
          upcomingEvents={upcomingEvents || []}
          recentBookings={recentBookings || []}
          newBookingsCount={newBookingsCount || 0}
        />
      </main>
    </div>
  )
}
