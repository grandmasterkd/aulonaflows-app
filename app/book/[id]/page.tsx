"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

interface Event {
  id: string
  name: string
  category: string
  description: string
  date_time: string
  location: string
  capacity: number
  price: number
  instructor_name: string
  image_url: string
  status: string
}

interface BookingForm {
  name: string
  email: string
  phone: string
  special_requirements: string
}

export default function BookEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    special_requirements: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string)
    }
  }, [params.id])

  const fetchEvent = async (eventId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (error) {
      console.error("Error fetching event:", error)
      router.push("/book")
    } else {
      setEvent(data)
    }
    setIsLoading(false)
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const customerInfo = {
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        special_requirements: bookingForm.special_requirements || null,
      }

      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: null, // Allow guest bookings
        class_id: event.id, // Use event ID as class_id
        booking_date: new Date().toISOString(),
        status: "confirmed",
        payment_status: "pending",
        notes: JSON.stringify({
          ...customerInfo,
          event_name: event.name,
        }),
      })

      if (bookingError) {
        console.error("Error creating booking:", bookingError)
        alert("Failed to create booking. Please try again.")
        return
      }

      alert("Booking confirmed! You will receive a confirmation email shortly.")
      router.push("/book")
    } catch (error) {
      console.error("Error processing booking:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isFullyBooked = () => {
    return false
  }

   if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center animate-pulse"><Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} /></div>
    }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Event not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link href="/book" className="inline-flex items-center gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Details */}
          <Card>
            <div
              className="h-64 bg-cover bg-center relative rounded-t-lg"
              style={{
                backgroundImage: `url(${event.image_url || "/diverse-yoga-class.png"})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-t-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <h1 className="text-2xl font-bold">{event.name}</h1>
                <p className="text-sm opacity-90">{event.category}</p>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Date:</span> {formatDate(event.date_time)}
                </p>
                <p>
                  <span className="font-medium">Instructor:</span> {event.instructor_name}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {event.location}
                </p>
                <p>
                  <span className="font-medium">Spaces:</span> Available/{event.capacity}
                </p>
                <p className="text-2xl font-bold text-[#654625]">£{event.price}</p>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book Your Spot</CardTitle>
            </CardHeader>
            <CardContent>
              {isFullyBooked() ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600 mb-4">This event is fully booked</p>
                  <Link
                    href="/book"
                    className="brand-bg-brown brand-text-cream px-6 py-2 rounded-3xl font-medium hover:bg-opacity-90 transition-all"
                  >
                    Browse Other Events
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="special_requirements">Special Requirements</Label>
                    <Textarea
                      id="special_requirements"
                      value={bookingForm.special_requirements}
                      onChange={(e) => handleInputChange("special_requirements", e.target.value)}
                      placeholder="Any injuries, dietary requirements, or other notes..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full brand-bg-brown brand-text-cream hover:bg-opacity-90 py-3 text-lg font-medium"
                  >
                    {isSubmitting ? "Processing..." : `Book Now - £${event.price}`}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
