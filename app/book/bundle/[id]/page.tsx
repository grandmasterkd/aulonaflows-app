"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MapPin, User, Phone } from "lucide-react"
import { calculateBundlePrice } from "@/lib/utils/bundles"

interface Event {
  id: string
  name: string
  category: string
  description: string
  date_time: string
  location: string
  price: number
  instructor_name: string
  image_url: string
}

interface Bundle {
  id: string
  name: string
  description: string
  discount_percentage: number
  total_price: number
  events: Event[]
}

export default function BundleBookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const bundleId = params.id as string
  const eventIds = searchParams.get('events')?.split(',') || []

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    fetchBundle()
  }, [bundleId])

  const fetchBundle = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("event_bundles")
      .select(`
        *,
        bundle_events (
          events (*)
        )
      `)
      .eq("id", bundleId)
      .single()

    if (error) {
      console.error("Error fetching bundle:", error)
      setMessage({ type: "error", text: "Failed to load bundle details." })
    } else {
      const bundleData = {
        ...data,
        events: data.bundle_events?.map((be: any) => be.events) || []
      }

      // Filter events based on selected event IDs
      const filteredEvents = bundleData.events.filter((event: Event) =>
        eventIds.includes(event.id)
      )

      setBundle(bundleData)
      setSelectedEvents(filteredEvents)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "Please fill in all required fields." })
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()
    const pricing = calculateBundlePrice(selectedEvents)

    try {
      // Create a single booking record for the bundle
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          amount: pricing.discountedTotal,
          booking_status: "confirmed",
          bundle_id: bundleId,
        }])
        .select()
        .single()

      if (bookingError) {
        throw bookingError
      }

      // Update booking counts for each event
      for (const event of selectedEvents) {
        await supabase.rpc('increment_event_booking_count', { event_id: event.id })
      }

      setMessage({
        type: "success",
        text: "Bundle booking confirmed! You will receive a confirmation email shortly."
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        notes: "",
      })

    } catch (error) {
      console.error("Error creating booking:", error)
      setMessage({
        type: "error",
        text: "Failed to create booking. Please try again."
      })
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

  const pricing = calculateBundlePrice(selectedEvents)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h1>
          <Link href="/book" className="text-blue-600 hover:text-blue-800">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/book" className="inline-flex items-center gap-2 text-[#654625] hover:text-[#4a3319] mb-4">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{bundle.name}</h1>
          {bundle.description && (
            <p className="text-gray-600 mt-2">{bundle.description}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bundle Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Events in This Bundle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date_time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {event.instructor_name}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Bundle Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Individual Events Total:</span>
                    <span>£{pricing.originalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bundle Discount ({pricing.discountPercentage}%):</span>
                    <span>-£{(pricing.originalTotal - pricing.discountedTotal).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Bundle Total:</span>
                      <span className="text-green-600">£{pricing.discountedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book This Bundle</CardTitle>
              </CardHeader>
              <CardContent>
                {message && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      message.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#654625] hover:bg-[#4a3319] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : `Book Bundle - £${pricing.discountedTotal.toFixed(2)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}