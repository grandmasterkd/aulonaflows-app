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
import { Edit, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Event {
  id: string
  name: string
  category: string
  description: string
  date_time: string
  location: string
  capacity: number
  current_bookings: number
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

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const eventData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      date_time: formData.date_time,
      location: formData.location,
      capacity: Number.parseInt(formData.capacity),
      price: Number.parseFloat(formData.price),
      instructor_name: formData.instructor_name,
      image_url: formData.image_url || "/placeholder.svg?height=400&width=600",
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
    } else {
      setIsDialogOpen(false)
      setEditingEvent(null)
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

  if (isLoading) {
     return <div className="min-h-screen flex items-center justify-center animate-pulse"><Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} /></div>
   }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Events</h1>

      {/* Table Header with Search and Add Button */}
      <div className="brand-bg-beige/40 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Events</h2>
          <div className="flex gap-4">
            <Input placeholder="Search events..." className="max-w-sm" />
            <Button onClick={handleAddNew} className="brand-text-yellow bg-[#F7BA4C] hover:bg-[#F7BA4C]/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="brand-bg-beige rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="brand-bg-beige">
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
            {events.map((event) => (
              <TableRow key={event.id} className="bg-white">
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.category}</TableCell>
                <TableCell>{formatDate(event.date_time)}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.capacity}</TableCell>
                <TableCell>{event.current_bookings}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                >
                  <SelectTrigger>
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
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="/placeholder.svg?height=400&width=600"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="brand-bg-beige text-black hover:bg-opacity-90">
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
