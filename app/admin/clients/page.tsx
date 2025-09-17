"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchClients()
  }, []) // Added checkAuth to useEffect dependency array

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
    }
  }

  const fetchClients = async () => {
    const supabase = createClient()

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("notes, createdAt")
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      setIsLoading(false)
      return
    }

    const clientMap = new Map<string, Client>()

    bookings?.forEach((booking) => {
      try {
        const clientInfo = JSON.parse(booking.notes || "{}")
        const email = clientInfo.email

        if (email && clientInfo.name) {
          if (clientMap.has(email)) {
            const client = clientMap.get(email)!
            client.booking_count += 1
          } else {
            clientMap.set(email, {
              name: clientInfo.name,
              email: clientInfo.email,
              phone: clientInfo.phone || "N/A",
              location: "Glasgow", // Default location
              date_joined: booking.createdAt,
              booking_count: 1,
            })
          }
        }
      } catch (e) {
        console.error("Error parsing booking notes:", e)
      }
    })

    setClients(Array.from(clientMap.values()))
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
        // Explicitly type booking.events
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

  if (isLoading) {
     return <div className="min-h-screen flex items-center justify-center animate-pulse"><Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} /></div>
   }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Clients</h1>

      {/* Table Header with Search */}
      <div className="brand-bg-beige/40 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Clients</h2>
          <Input placeholder="Search clients..." className="max-w-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="brand-bg-beige rounded-lg overflow-hidden">
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
            {clients.map((client) => (
              <TableRow key={client.email} className="bg-white">
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

      {/* Client Details Dialog */}
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
                      <Badge className={getPaymentStatusColor(booking.payment_status)}>{booking.payment_status}</Badge>
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
  )
}
