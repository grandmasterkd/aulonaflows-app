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
import { ArrowLeft, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
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

    if (!formData.category) {
      setMessage({
        type: "error",
        text: "Please select a category for the event.",
      })
      return
    }

    const supabase = createClient()

    let imageUrl = formData.image_url || "/placeholder.svg?height=400&width=600"

    // Prevent any blob URLs from being saved to database
    if (imageUrl.startsWith("blob:")) {
      console.error("[v0] ❌ Detected blob URL in formData.image_url:", imageUrl)
      if (!selectedImage) {
        setMessage({
          type: "error",
          text: "Please select a new image to upload.",
        })
        return
      }
      // If there's a selected image, we'll upload it below and replace the blob URL
      imageUrl = "/placeholder.svg?height=400&width=600"
    }

    // Only upload if a new image file was selected
    if (selectedImage) {
      console.log("[v0] Starting image upload to Vercel Blob...")
      try {
        const formDataBlob = new FormData()
        formDataBlob.append("file", selectedImage)

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formDataBlob,
        })

        console.log("[v0] Upload response status:", uploadResponse.status)

        if (uploadResponse.ok) {
          const responseData = await uploadResponse.json()
          console.log("[v0] Upload response data:", responseData)

          if (responseData.url) {
            imageUrl = responseData.url
            console.log("[v0] ✅ Image uploaded successfully:", imageUrl)
          } else {
            throw new Error("No URL in response")
          }
        } else {
          const errorText = await uploadResponse.text()
          console.error("[v0] ❌ Upload failed with status:", uploadResponse.status, errorText)
          throw new Error(`Upload failed: ${uploadResponse.status}`)
        }
      } catch (error) {
        console.error("[v0] ❌ Error uploading image:", error)
        setMessage({
          type: "error",
          text: "Failed to upload image. Please try again.",
        })
        return
      }
    }

    if (imageUrl.startsWith("blob:")) {
      console.error("[v0] ❌ Final check: blob URL detected, blocking save:", imageUrl)
      setMessage({
        type: "error",
        text: "Cannot save temporary image URL. Please upload the image again.",
      })
      return
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
      image_url: imageUrl,
      status: formData.status,
      ...(editingEvent ? {} : { booking_count: 0 }),
    }

    console.log("[v0] 💾 Saving event with image URL:", eventData.image_url)

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
      setImagePreviewUrl("")
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
    setImagePreviewUrl("")
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
    setImagePreviewUrl(event.image_url)
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
      console.log("[v0] 📁 Image file selected:", file.name, file.size, "bytes")
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreviewUrl(previewUrl)
      console.log("[v0] 👁️ Preview URL created (temporary):", previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreviewUrl("")
    setFormData({ ...formData, image_url: "" })
    const fileInput = document.getElementById("image_upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
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
          <div className="space-y-6">
            <ArrowLeft
              className="size-6 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => window.history.back()}
            />

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
                    <Input placeholder="Search events..." className="w-[250px] h-12 rounded-lg bg-white border-none" />
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
                    {events.map((event) => (
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

                      {(imagePreviewUrl || formData.image_url) && (
                        <div className="relative">
                          <img
                            src={imagePreviewUrl || formData.image_url || "/placeholder.svg"}
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
