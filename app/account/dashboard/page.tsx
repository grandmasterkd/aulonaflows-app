"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Package,
  Filter,
  Download,
  Eye
} from "lucide-react"
import Image from "next/image"
import { authService } from "@/lib/services/auth-service"
import { bookingService } from "@/lib/services/booking-service"
import { creditService } from "@/lib/services/credit-service"

interface Booking {
  id: string
  booking_reference: string
  amount: number
  booking_status: string
  payment_status: string
  booking_date: string
  events?: Array<{
    name: string
    date_time: string
  }>
  bundle?: {
    name: string
  }
}

interface Credit {
  id: string
  credit_amount: number
  used_amount: number
  expires_at: string
  status: string
}

export default function AccountDashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    await loadDashboardData(currentUser.id)
    setIsLoading(false)
  }

  const loadDashboardData = async (userId: string) => {
    try {
      const [bookingsData, creditsData, balance] = await Promise.all([
        bookingService.getUserBookings(userId),
        creditService.getUserCredits(userId),
        creditService.getUserCreditBalance(userId)
      ])

      setAllBookings(bookingsData)
      setBookings(bookingsData.slice(0, 5)) // Show last 5 bookings
      setCredits(creditsData)
      setCreditBalance(balance)

      // Calculate total spent from confirmed/paid bookings
      const total = bookingsData
        .filter(booking => booking.booking_status === 'confirmed' && booking.payment_status === 'paid')
        .reduce((sum, booking) => sum + booking.amount, 0)
      setTotalSpent(total)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const handleLogout = async () => {
    await authService.signOut()
    router.push("/")
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh dashboard data
        await loadDashboardData(user!.id)

        alert(`Booking cancelled successfully. ${result.refundAmount > 0 ? `Refund of £${result.refundAmount} will be processed.` : ''} ${result.creditAmount > 0 ? `Credit of £${result.creditAmount} has been added to your account.` : ''}`)
      } else {
        alert(`Failed to cancel booking: ${result.error}`)
      }
    } catch (error) {
      console.error("Cancel booking error:", error)
      alert("An error occurred while cancelling the booking.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
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

  const getFilteredBookings = () => {
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date)
      return bookingDate.getFullYear() === selectedYear &&
             bookingDate.getMonth() === selectedMonth
    })
  }

  const availableYears = Array.from(
    new Set(allBookings.map(booking => new Date(booking.booking_date).getFullYear()))
  ).sort((a, b) => b - a) // Most recent first

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Image
                src="/aulonaflows-logo-dark.svg"
                alt="AulonaFlows"
                width={40}
                height={40}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/account/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credit Balance</p>
                  <p className="text-2xl font-bold text-gray-900">£{creditBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Credits</p>
                  <p className="text-2xl font-bold text-gray-900">{credits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
              <Link href="/book">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Book New Event
                </Button>
              </Link>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-4">Start your wellness journey by booking your first event.</p>
                  <Link href="/book">
                    <Button>Browse Events</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium">
                              {booking.bundle ? booking.bundle.name : booking.events?.[0]?.name}
                            </h3>
                            <Badge className={getStatusColor(booking.booking_status)}>
                              {booking.booking_status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(booking.payment_status)}>
                              {booking.payment_status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Booking Reference: {booking.booking_reference}</p>
                            <p>Date: {formatDate(booking.booking_date)}</p>
                            <p>Amount: £{booking.amount}</p>
                            {booking.events && booking.events.length > 0 && (
                              <p>Event: {booking.events[0].name} - {formatDate(booking.events[0].date_time)}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/account/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                           {booking.booking_status === 'confirmed' && (
                             <Button
                               variant="outline"
                               size="sm"
                               className="text-red-600 hover:text-red-700"
                               onClick={() => handleCancelBooking(booking.id)}
                             >
                               Cancel
                             </Button>
                           )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {bookings.length >= 5 && (
                  <div className="text-center">
                    <Link href="/account/bookings">
                      <Button variant="outline">View All Bookings</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Event Credits</h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">£{creditBalance.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Available Balance</p>
              </div>
            </div>

            {credits.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No credits available</h3>
                  <p className="text-gray-600">Credits are issued for cancellations and can be used for future bookings.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {credits.map((credit) => (
                  <Card key={credit.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">£{(credit.credit_amount - credit.used_amount).toFixed(2)} Available</h3>
                          <p className="text-sm text-gray-600">
                            Expires: {formatDate(credit.expires_at)}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

           <TabsContent value="profile" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Profile Information</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                     <div>
                       <label className="text-sm font-medium text-gray-600">Full Name</label>
                       <p className="text-lg">{user?.first_name} {user?.last_name}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600">Email</label>
                       <p className="text-lg">{user?.email}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600">Phone</label>
                       <p className="text-lg">{user?.phone || 'Not provided'}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600">Account Created</label>
                       <p className="text-lg">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600">Account Status</label>
                       <Badge className={user?.account_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                         {user?.account_status || 'Unknown'}
                       </Badge>
                     </div>
                   </div>

                   <div className="pt-4">
                     <Link href="/account/settings">
                       <Button>
                         <Settings className="w-4 h-4 mr-2" />
                         Edit Profile
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Account Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium text-gray-600">Total Bookings</label>
                       <p className="text-2xl font-bold text-gray-900">{allBookings.length}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600">Total Spent</label>
                       <p className="text-2xl font-bold text-gray-900">£{totalSpent.toFixed(2)}</p>
                     </div>
                   </div>
                   <div>
                     <label className="text-sm font-medium text-gray-600">Current Credit Balance</label>
                     <p className="text-xl font-semibold text-green-600">£{creditBalance.toFixed(2)}</p>
                   </div>
                 </CardContent>
               </Card>
             </div>

             <Card>
               <CardHeader>
                 <div className="flex justify-between items-center">
                   <CardTitle>Purchase History</CardTitle>
                   <div className="flex gap-2">
                     <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                       <SelectTrigger className="w-24">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {availableYears.map(year => (
                           <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                       <SelectTrigger className="w-32">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {monthNames.map((month, index) => (
                           <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 {getFilteredBookings().length === 0 ? (
                   <p className="text-gray-600 text-center py-8">No purchases found for {monthNames[selectedMonth]} {selectedYear}</p>
                 ) : (
                   <div className="space-y-4">
                     {getFilteredBookings().map((booking) => (
                       <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                         <div>
                           <h4 className="font-medium">
                             {booking.bundle ? booking.bundle.name : booking.events?.[0]?.name}
                           </h4>
                           <p className="text-sm text-gray-600">
                             {formatDate(booking.booking_date)} • Ref: {booking.booking_reference}
                           </p>
                           <div className="flex gap-2 mt-1">
                             <Badge className={getStatusColor(booking.booking_status)}>
                               {booking.booking_status}
                             </Badge>
                             <Badge className={getPaymentStatusColor(booking.payment_status)}>
                               {booking.payment_status}
                             </Badge>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-lg font-semibold">£{booking.amount}</p>
                           <Link href={`/account/bookings/${booking.id}`}>
                             <Button variant="outline" size="sm">View Details</Button>
                           </Link>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}