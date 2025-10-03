"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminNav } from "@/components/admin-nav"

interface Client {
  name: string
  email: string
  phone: string
  location: string
  date_joined: string
  booking_count: number
}

interface ClientBooking {
  id: string
  name: string
  booking_date: string
  event_name: string
  payment_status: string
  booking_status: string
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminName, setAdminName] = useState("")
  const [adminRole, setAdminRole] = useState("")
  const [newBookingsCount, setNewBookingsCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchClients()
    fetchNewBookingsCount()
  }, [])

  useEffect(() => {
    const filtered = clients.filter((client) => {
      const name = client.name?.toLowerCase() || ""
      const email = client.email?.toLowerCase() || ""
      const phone = client.phone?.toLowerCase() || ""
      const location = client.location?.toLowerCase() || ""
      const search = searchTerm.toLowerCase()

      return name.includes(search) || email.includes(search) || phone.includes(search) || location.includes(search)
    })
    setFilteredClients(filtered)
  }, [searchTerm, clients])

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
    }
  }

  const fetchClients = async () => {
    const supabase = createClient()

    const { data: clientsData, error } = await supabase
      .from("clients")
      .select("*")
      .order("date_joined", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      setIsLoading(false)
      return
    }

    setClients(clientsData || [])
    setFilteredClients(clientsData || [])
    setIsLoading(false)
  }

  const fetchClientBookings = async (email: string) => {
    const supabase = createClient()

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        notes,
        booking_date,
        payment_status,
        status,
        events (
          name
        )
      `)
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching client bookings:", error)
      return
    }

    const formattedBookings: ClientBooking[] = []

    bookings?.forEach((booking) => {
      try {
        const events = booking.events as { name: string }[] | { name: string } | null | undefined
        const clientInfo = JSON.parse(booking.notes || "{}")
        if (clientInfo.email === email) {
          formattedBookings.push({
            id: booking.id,
            name: clientInfo.name,
            booking_date: booking.booking_date,
            event_name: Array.isArray(events)
              ? events[0]?.name || "Unknown Event"
              : (events as { name: string } | undefined)?.name || "Unknown Event",
            payment_status: booking.payment_status,
            booking_status: booking.status,
          })
        }
      } catch (e) {
        console.error("Error parsing booking notes:", e)
      }
    })

    setClientBookings(formattedBookings)
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

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client)
    await fetchClientBookings(client.email)
    setIsDialogOpen(true)
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
        return "bg-yellow-100 text-yellow-800 h-8 rounded-lg"
      case "failed":
        return "bg-red-100 text-red-800 h-8 rounded-lg"
      default:
        return "bg-gray-100 text-gray-800 h-8 rounded-lg"
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
          <AdminNav
            adminName={adminName}
            adminRole={adminRole}
            pageTitle="Clients"
            newBookingsCount={newBookingsCount}
          />

          <div className="space-y-6">
            <ArrowLeft
              className="size-6 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => window.history.back()}
            />

            <section>
              <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">All Clients</h2>
                  <Input
                    placeholder="Search clients..."
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
                      <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Email</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Phone Number</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Location</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Date Joined</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Booking Count</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.email}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.location}</TableCell>
                        <TableCell>{formatDate(client.date_joined)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{client.booking_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Client Bookings - {selectedClient?.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedClient?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedClient?.phone}</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Booking Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm">{booking.id.slice(0, 8)}...</TableCell>
                          <TableCell>{booking.name}</TableCell>
                          <TableCell>{formatDate(booking.booking_date)}</TableCell>
                          <TableCell>{booking.event_name}</TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(booking.payment_status)}>
                              {booking.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.booking_status)}>{booking.booking_status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  )
}
