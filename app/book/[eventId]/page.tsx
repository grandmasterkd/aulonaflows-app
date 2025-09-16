"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface YogaClass {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  price: number
  status: string
  instructor_id: string
  class_type_id: string
  // Joined data
  instructor_name?: string
  class_type_name?: string
}

export default function SubmitBookingPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.eventId as string

  const [yogaClass, setYogaClass] = useState<YogaClass | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchClass = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("yoga_classes")
      .select(`
        *,
        instructors(name),
        class_types(name)
      `)
      .eq("id", classId)
      .single()

    if (error) {
      console.error("Error fetching class:", error)
      router.push("/book")
    } else {
      const transformedData = {
        ...data,
        instructor_name: data.instructors?.name || "TBA",
        class_type_name: data.class_types?.name || "Yoga Class",
      }
      setYogaClass(transformedData)
    }
    setIsLoading(false)
  }, [classId, router])

  useEffect(() => {
    fetchClass()
  }, [fetchClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yogaClass) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { data: currentClass } = await supabase.from("yoga_classes").select("*").eq("id", classId).single()

    if (!currentClass || currentClass.current_bookings >= currentClass.max_capacity) {
      setError("Sorry, this class is now fully booked.")
      setIsSubmitting(false)
      return
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          class_id: classId,
          user_id: null, // Public booking, no user account required
          notes: formData.comment,
          payment_status: "pending",
          status: "confirmed",
        },
      ])
      .select()
      .single()

    if (bookingError) {
      console.error("Error creating booking:", bookingError)
      setError("Failed to create booking. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Create a contact message record for the booking details
    const { error: contactError } = await supabase.from("contact_messages").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Booking for ${yogaClass.title}`,
        message: `Booking details: ${formData.comment || "No additional comments"}`,
        status: "new",
      },
    ])

    if (contactError) {
      console.error("Error creating contact record:", contactError)
    }

    setSuccess(true)
    setIsSubmitting(false)
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
    return yogaClass && yogaClass.current_bookings >= yogaClass.max_capacity
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!yogaClass) {
    return <div className="min-h-screen flex items-center justify-center">Class not found</div>
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for booking <strong>{yogaClass.title}</strong>. You will receive a confirmation email shortly
              with payment instructions.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/book">Book Another Session</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/book">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Class Details */}
          <div className="space-y-8">
            {/* Class Image */}
            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src="/diverse-yoga-class.png"
                alt={yogaClass.title}
                width={600}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Class Info */}
            <div className="space-y-6">
              <div>
                <h1 className="headline-text text-3xl md:text-4xl font-bold mb-4">{yogaClass.title}</h1>
                <p className="paragraph-text text-lg leading-relaxed">{yogaClass.description}</p>
              </div>

              <hr className="border-gray-300" />

              {/* Class Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs paragraph-text uppercase tracking-wider">Instructor</p>
                  <p className="text-lg font-medium">{yogaClass.instructor_name}</p>
                </div>

                <div>
                  <p className="text-xs paragraph-text uppercase tracking-wider">Price</p>
                  <p className="text-lg font-medium">£{yogaClass.price}</p>
                </div>

                <div>
                  <p className="text-xs paragraph-text uppercase tracking-wider">Type</p>
                  <p className="text-lg font-medium">{yogaClass.class_type_name}</p>
                </div>

                <div>
                  <p className="text-xs paragraph-text uppercase tracking-wider">Date & Time</p>
                  <p className="text-lg font-medium">{formatDate(yogaClass.start_time)}</p>
                </div>

                <div>
                  <p className="text-xs paragraph-text uppercase tracking-wider">Availability</p>
                  <p className="text-lg font-medium">
                    {yogaClass.current_bookings}/{yogaClass.max_capacity} booked
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-8">
            {isFullyBooked() ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-red-600">Class Fully Booked</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Unfortunately, this class is fully booked. Please check our other available sessions.
                  </p>
                  <Button asChild>
                    <Link href="/book">View Other Classes</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Book Your Spot</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1"
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
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="comment">Additional Comments</Label>
                      <Textarea
                        id="comment"
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        rows={4}
                        className="mt-1"
                        placeholder="Any special requirements or questions..."
                      />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                        <Link href="/book">Back</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 brand-bg-brown brand-text-cream hover:bg-opacity-90 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? "Processing..." : "Proceed to Payment"}
                        {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
