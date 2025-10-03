"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Settings, ChevronDown, User, LogOut } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getImageUrl } from "@/lib/utils/images"
import { createClient } from "@/lib/supabase/client"

interface DashboardContentProps {
  adminName: string
  adminRole: string
  totalRevenue: number
  totalCustomers: number
  totalBookings: number
  monthlyBookings: { month: string; bookings: number }[]
  currentYear: number
  monthlyData: {
    bookings: number
    revenue: number
    clients: number
  }
  upcomingEvents: any[]
  recentBookings: any[]
  newBookingsCount: number
}

const PIE_COLORS = {
  bookings: "#FFCD85",
  revenue: "#AD8853",
  clients: "#7F633C",
}

export function DashboardContent({
  adminName,
  adminRole,
  totalRevenue,
  totalCustomers,
  totalBookings,
  monthlyBookings,
  currentYear,
  monthlyData,
  upcomingEvents,
  recentBookings,
  newBookingsCount,
}: DashboardContentProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleDateString("en-US", { month: "long" }))
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const router = useRouter()

  const availableYears = [currentYear, currentYear - 1, currentYear - 2]
  const availableMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const pieChartData = [
    { name: "Total Bookings", value: monthlyData.bookings, color: PIE_COLORS.bookings },
    { name: "Total Revenue", value: monthlyData.revenue, color: PIE_COLORS.revenue },
    { name: "Total Clients", value: monthlyData.clients, color: PIE_COLORS.clients },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="bg-white rounded-2xl h-24 px-6 flex items-center justify-between shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome, {adminName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {newBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {newBookingsCount > 9 ? "9+" : newBookingsCount}
              </span>
            )}
          </Link>
          <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#AD8853] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">{adminRole}</p>
              </div>
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">£{totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Total Bookings</h2>
                <div className="relative">
                  <button
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {selectedYear}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isYearDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year)
                            setIsYearDropdownOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <ChartContainer
                config={{
                  bookings: {
                    label: "Bookings",
                    color: "#AD8853",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="bookings" fill="#AD8853" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-end mb-4">
                <div className="relative">
                  <button
                    onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {selectedMonth}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isMonthDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 max-h-60 overflow-y-auto">
                      {availableMonths.map((month) => (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(month)
                            setIsMonthDropdownOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <ChartContainer
                config={{
                  bookings: { label: "Bookings", color: PIE_COLORS.bookings },
                  revenue: { label: "Revenue", color: PIE_COLORS.revenue },
                  clients: { label: "Clients", color: PIE_COLORS.clients },
                }}
                className="h-[250px]"
              >
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS.bookings }} />
                    <span className="text-sm text-gray-600">Total Bookings</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{monthlyData.bookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS.revenue }} />
                    <span className="text-sm text-gray-600">Total Revenue</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">£{monthlyData.revenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS.clients }} />
                    <span className="text-sm text-gray-600">Total Clients</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{monthlyData.clients}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Coming Up Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="h-32 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${event.image_url ? getImageUrl(event.image_url) : "/aulona-bookings-placeholder.webp"})`,
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{event.name}</h3>
                      <p className="text-xs text-gray-600">{formatDate(event.date_time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Bookings</h2>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#AD8853] flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{booking.clients?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate">{booking.events?.name || "Event"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
