"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminNav } from "@/components/admin-nav"
import { AdminPagination } from "@/components/admin-pagination"
import { calculateBundleDiscount, calculateBundlePrice, validateBundleEventCount } from "@/lib/utils/bundles"
import Image from "next/image"

interface Bundle {
  id: string
  name: string
  description: string
  discount_percentage: number
  total_price: number
  status: string
  event_count: number
  events: Array<{
    id: string
    name: string
    price: number
  }>
}

interface Event {
  id: string
  name: string
  category: string
  price: number
  date_time: string
  status: string
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedEventIds: [] as string[],
    status: "active",
  })
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [adminRole, setAdminRole] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [newBookingsCount, setNewBookingsCount] = useState(0)

  useEffect(() => {
    checkAuth()
    fetchBundles(currentPage)
    fetchEvents()
  }, [currentPage])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
      setProfileImage(profile.image_url)
    }
  }

  const fetchBundles = async (page: number = 1) => {
    const supabase = createClient()
    const offset = (page - 1) * itemsPerPage
    const { data, error, count } = await supabase
      .from("event_bundles")
      .select(`
        *,
        bundle_events (
          events (
            id,
            name,
            price
          )
        )
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + itemsPerPage - 1)

    if (error) {
      console.error("Error fetching bundles:", error)
    } else {
      const formattedBundles = (data || []).map(bundle => ({
        ...bundle,
        event_count: bundle.bundle_events?.length || 0,
        events: bundle.bundle_events?.map((be: any) => be.events) || []
      }))
      setBundles(formattedBundles)
      setTotalItems(count || 0)
    }
    setIsLoading(false)
  }

  const fetchEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("events")
      .select("id, name, category, price, date_time, status")
      .eq("status", "active")
      .order("date_time", { ascending: true })

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data || [])
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a bundle name.",
      })
      return
    }

    if (!validateBundleEventCount(formData.selectedEventIds.length)) {
      setMessage({
        type: "error",
        text: "Bundles must include between 2 and 5 events.",
      })
      return
    }

    const selectedEvents = events.filter(event => formData.selectedEventIds.includes(event.id))
    const { discountedTotal } = calculateBundlePrice(selectedEvents)
    const discountPercentage = calculateBundleDiscount(selectedEvents.length)

    const supabase = createClient()

    const bundleData = {
      name: formData.name,
      description: formData.description,
      discount_percentage: discountPercentage,
      total_price: discountedTotal,
      status: formData.status,
    }

    let bundleId: string

    if (editingBundle) {
      const { error: updateError } = await supabase
        .from("event_bundles")
        .update(bundleData)
        .eq("id", editingBundle.id)

      if (updateError) {
        console.error("Error updating bundle:", updateError)
        setMessage({
          type: "error",
          text: "Failed to update bundle. Please try again.",
        })
        return
      }

      bundleId = editingBundle.id

      // Delete existing bundle events
      await supabase.from("bundle_events").delete().eq("bundle_id", bundleId)
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from("event_bundles")
        .insert([bundleData])
        .select()
        .single()

      if (insertError) {
        console.error("Error creating bundle:", insertError)
        setMessage({
          type: "error",
          text: "Failed to create bundle. Please try again.",
        })
        return
      }

      bundleId = insertData.id
    }

    // Insert new bundle events
    const bundleEventsData = formData.selectedEventIds.map(eventId => ({
      bundle_id: bundleId,
      event_id: eventId,
    }))

    const { error: bundleEventsError } = await supabase
      .from("bundle_events")
      .insert(bundleEventsData)

    if (bundleEventsError) {
      console.error("Error creating bundle events:", bundleEventsError)
      setMessage({
        type: "error",
        text: "Bundle created but failed to associate events. Please try again.",
      })
      return
    }

    setMessage({
      type: "success",
      text: `Bundle ${editingBundle ? "updated" : "created"} successfully.`,
    })
    setIsDialogOpen(false)
    setEditingBundle(null)
    resetForm()
    fetchBundles()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      selectedEventIds: [],
      status: "active",
    })
  }

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setFormData({
      name: bundle.name,
      description: bundle.description || "",
      selectedEventIds: bundle.events.map(event => event.id),
      status: bundle.status,
    })
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingBundle(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDelete = async (bundleId: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("event_bundles").delete().eq("id", bundleId)

    if (error) {
      console.error("Error deleting bundle:", error)
      setMessage({
        type: "error",
        text: "Failed to delete bundle. Please try again.",
      })
    } else {
      setMessage({
        type: "success",
        text: "Bundle deleted successfully.",
      })
      fetchBundles()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleEventToggle = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEventIds: prev.selectedEventIds.includes(eventId)
        ? prev.selectedEventIds.filter(id => id !== eventId)
        : [...prev.selectedEventIds, eventId]
    }))
  }

  const selectedEvents = events.filter(event => formData.selectedEventIds.includes(event.id))
  const pricing = calculateBundlePrice(selectedEvents)

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
        <AdminNav
          adminName={adminName}
          adminRole={adminRole}
          profileImage={profileImage}
          pageTitle="Event Bundles"
          newBookingsCount={newBookingsCount}
        />
        <div className="p-6 md:p-8">
          <div className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <section>
              <div className="w-full bg-[#E3C9A3]/40 p-4 rounded-none">
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center">
                  <h2 className="text-xl font-medium">All Event Bundles</h2>
                  <div className="flex md:flex-none flex-wrap grow-1 gap-2">
                    <Input
                      placeholder="Search bundles..."
                      className="w-full md:w-[250px] h-12 rounded-lg bg-white border-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      onClick={handleAddNew}
                      className="brand-text-yellow h-12 px-3 rounded-lg bg-[#F7BA4C] hover:bg-[#F7BA4C]/90 text-black"
                    >
                      <Plus className="w-4 h-4 mr-0" />
                      Add Bundle
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="h-14 brand-bg-beige">
                    <TableRow>
                      <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Events</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Discount</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Total Price</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Status</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBundles.map((bundle) => (
                      <TableRow key={bundle.id}>
                        <TableCell className="font-medium">{bundle.name}</TableCell>
                        <TableCell>{bundle.event_count} events</TableCell>
                        <TableCell>{bundle.discount_percentage}% off</TableCell>
                        <TableCell>£{bundle.total_price}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bundle.status)}>{bundle.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              className="cursor-pointer bg-[#73B1EA] flex items-center justify-center h-8 w-8 rounded-lg"
                              onClick={() => handleEdit(bundle)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="cursor-pointer bg-red-500 hover:bg-red-600 flex items-center justify-center h-8 w-8 rounded-lg"
                              onClick={() => handleDelete(bundle.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
             </section>

             <AdminPagination
               currentPage={currentPage}
               totalItems={totalItems}
               itemsPerPage={itemsPerPage}
             />

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBundle ? "Edit Event Bundle" : "Create New Event Bundle"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Bundle Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Select Events (2-5 events required)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`event-${event.id}`}
                            checked={formData.selectedEventIds.includes(event.id)}
                            onChange={() => handleEventToggle(event.id)}
                            className="rounded"
                          />
                          <label htmlFor={`event-${event.id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium">{event.name}</div>
                            <div className="text-gray-500 text-xs">
                              {event.category} • £{event.price} • {new Date(event.date_time).toLocaleDateString()}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Selected: {selectedEvents.length} events
                      {!validateBundleEventCount(selectedEvents.length) && selectedEvents.length > 0 && (
                        <span className="text-red-600 ml-2">Must select 2-5 events</span>
                      )}
                    </div>
                  </div>

                  {selectedEvents.length >= 2 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Bundle Pricing</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Original Total:</span>
                          <span>£{pricing.originalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount ({pricing.discountPercentage}%):</span>
                          <span className="text-green-600">-£{(pricing.originalTotal - pricing.discountedTotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Bundle Price:</span>
                          <span>£{pricing.discountedTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 bg-transparent"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="brand-bg-beige text-black hover:bg-opacity-90 h-11"
                      disabled={!validateBundleEventCount(selectedEvents.length)}
                    >
                      {editingBundle ? "Update Bundle" : "Create Bundle"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  )
}