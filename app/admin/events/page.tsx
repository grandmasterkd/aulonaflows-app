"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uploadImage } from "@/lib/supabase/storage"
import { getImageUrl } from "@/lib/utils/images"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Filter, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminNav } from "@/components/admin-nav"
import Image from "next/image"

interface Event {
  id: string
  name: string
  category: string
  description: string
  date_time: string
  location: string
  capacity: number
  booking_count: number
  price: number
  instructor_name: string
  image_url: string
  status: string
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    date_time: "",
    location: "",
    capacity: "",
    price: "",
    instructor_name: "",
    image_url: "",
    status: "active",
  })
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [adminRole, setAdminRole] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [newBookingsCount, setNewBookingsCount] = useState(0)

  useEffect(() => {
    checkAuth()
    fetchEvents()
    fetchNewBookingsCount()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFilterOpen])

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

  const fetchEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("events").select("*").order("date_time", { ascending: true })

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data || [])
    }
    setIsLoading(false)
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

    if (!formData.category) {
      setMessage({
        type: "error",
        text: "Please select a category for the event.",
      })
      return
    }

    const supabase = createClient()

    let imageUrl = formData.image_url

    if (selectedImage) {
      const uploadResult = await uploadImage(selectedImage)

      if (uploadResult.error) {
        setMessage({
          type: "error",
          text: `Failed to upload image: ${uploadResult.error}`,
        })
        return
      }

      imageUrl = uploadResult.relativePath
    }

    const eventData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      date_time: formData.date_time,
      location: formData.location,
      capacity: Number.parseInt(formData.capacity),
      price: Number.parseFloat(formData.price),
      instructor_name: formData.instructor_name,
      image_url: imageUrl || "events/placeholder.jpg",
      status: formData.status,
    }

    let error
    if (editingEvent) {
      const { error: updateError } = await supabase.from("events").update(eventData).eq("id", editingEvent.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("events").insert([eventData])
      error = insertError
    }

    if (error) {
      console.error("Error saving event:", error)
      setMessage({
        type: "error",
        text: "Failed to save event. Please try again.",
      })
    } else {
      setMessage({
        type: "success",
        text: `Event ${editingEvent ? "updated" : "created"} successfully.`,
      })
      setIsDialogOpen(false)
      setEditingEvent(null)
      setSelectedImage(null)
      resetForm()
      fetchEvents()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      date_time: "",
      location: "",
      capacity: "",
      price: "",
      instructor_name: "",
      image_url: "",
      status: "active",
    })
    setSelectedImage(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      category: event.category,
      description: event.description,
      date_time: new Date(event.date_time).toISOString().slice(0, 16),
      location: event.location,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      instructor_name: event.instructor_name,
      image_url: event.image_url,
      status: event.status,
    })
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingEvent(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image_url: imageUrl })
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setFormData({ ...formData, image_url: "" })
    const fileInput = document.getElementById("image_upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || event.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleFilterSelect = (filter: string) => {
    setStatusFilter(filter)
    setIsFilterOpen(false)
  }

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "all":
        return "All Events"
      case "active":
        return "Active"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Canceled"
      default:
        return "Filter"
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
          <AdminNav
            adminName={adminName}
            adminRole={adminRole}
            profileImage={profileImage}
            pageTitle="Events"
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
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">All Events</h2>
                  <div className="flex gap-2">
                    <div className="relative" ref={filterRef}>
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="h-12 px-4 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between gap-3 min-w-[140px] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-700" />
                          <span className="text-sm text-gray-700">{getFilterLabel()}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-700 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isFilterOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={() => handleFilterSelect("all")}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              statusFilter === "all" ? "font-semibold text-gray-900" : "text-gray-700"
                            }`}
                          >
                            All Events
                          </button>
                          <button
                            onClick={() => handleFilterSelect("active")}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              statusFilter === "active" ? "font-semibold text-gray-900" : "text-gray-700"
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleFilterSelect("completed")}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              statusFilter === "completed" ? "font-semibold text-gray-900" : "text-gray-700"
                            }`}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleFilterSelect("cancelled")}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              statusFilter === "cancelled" ? "font-semibold text-gray-900" : "text-gray-700"
                            }`}
                          >
                            Canceled
                          </button>
                        </div>
                      )}
                    </div>
                    <Input
                      placeholder="Search events..."
                      className="w-[250px] h-12 rounded-lg bg-white border-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      onClick={handleAddNew}
                      className="brand-text-yellow h-12 px-3 rounded-lg bg-[#F7BA4C] hover:bg-[#F7BA4C]/90 text-black"
                    >
                      <Plus className="w-4 h-4 mr-0" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </div>
              <div className=" overflow-hidden">
                <Table>
                  <TableHeader className="h-14 brand-bg-beige">
                    <TableRow>
                      <TableHead className="text-[#57463B] font-semibold">Name</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Category</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Date & Time</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Location</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Capacity</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Booked</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Status</TableHead>
                      <TableHead className="text-[#57463B] font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.category}</TableCell>
                        <TableCell>{formatDate(event.date_time)}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>{event.capacity}</TableCell>
                        <TableCell>{event.booking_count || 0}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="cursor-pointer bg-[#73B1EA] flex items-center justify-center h-8 w-fit p-0 px-4 rounded-lg"
                            onClick={() => handleEdit(event)}
                          >
                            Edit
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger className={!formData.category ? "border-red-300" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yoga Classes">Yoga Classes</SelectItem>
                          <SelectItem value="Sound Therapy">Sound Therapy</SelectItem>
                          <SelectItem value="Wellness Events">Wellness Events</SelectItem>
                          <SelectItem value="Corporate & Private Bookings">Corporate & Private Bookings</SelectItem>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date_time">Date & Time</Label>
                      <Input
                        id="date_time"
                        type="datetime-local"
                        value={formData.date_time}
                        onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (£)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructor_name">Instructor Name</Label>
                    <Input
                      id="instructor_name"
                      value={formData.instructor_name}
                      onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_upload">Event Image</Label>
                    <div className="flex items-start gap-3 mt-2">
                      <div className="relative">
                        <input
                          id="image_upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">Choose file</p>
                      </div>

                      {formData.image_url && (
                        <div className="relative">
                          <img
                            src={
                              formData.image_url.startsWith("blob:")
                                ? formData.image_url
                                : getImageUrl(formData.image_url)
                            }
                            alt="Event preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 bg-transparent"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="brand-bg-beige text-black hover:bg-opacity-90 h-11">
                      {editingEvent ? "Update Event" : "Create Event"}
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
