"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
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
  const searchParams = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
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

    if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment was cancelled. Please try again." })
    }
  }, [params.id, searchParams])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchEvent = async (eventId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (error) {
      console.error("Error fetching event:", error)
      router.push("/book")
    } else {
   
      if (data.image_url && !data.image_url.startsWith('http')) {
        data.image_url = supabase.storage.from('uploads').getPublicUrl(data.image_url).data.publicUrl
      }
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
    setMessage(null)

    try {
      const bookingData = {
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        notes: bookingForm.special_requirements || "",
      }

      // Create Stripe payment session
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          bookingData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No payment URL received")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred. Please try again.",
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

  const isFullyBooked = () => {
    return false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} />
      </div>
    )
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Event not found</div>
  }

  return (
    <main className="min-h-screen w-full grid place-items-center px-8 md:px-[21rem] py-12 md:py-0">
    
        {/* Back Button */}
        <div className="w-full" >
        <Link href="/book" className="w-fit inline-flex text-left gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
          <ArrowLeft size={20} />
          Back to Events
        </Link>
        </div>
       

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.type === "error" && <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="w-full grid md:grid-cols-2 gap-8">
          <div className="relative h-[400px] md:h-full bg-gray-200 rounded-3xl overflow-hidden">
            <Image
              src={event?.image_url || "/diverse-yoga-class.png"}
              alt={event.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

       
            <div className="w-full flex flex-col items-start gap-y-6 md:gap-y-4">
              <div>
                <h1 className="headline-text leading-normal lg:leading-normal md:leading-normal text-3xl md:text-4xl lg:text-5xl font-bold">
                  {event.name}
                </h1>
                <p className="paragraph-text text-sm md:text-base leading-relaxed">{event.description}</p>
              </div>

              <span className="w-full h-0.5 bg-gray-200 "></span>

              <div className="w-full flex items-start justify-between">
                <div>
                  <span className="block paragraph-text text-xs">Instructor</span>{" "}
                  <span className="block">{event.instructor_name}</span>
                </div>

                <div>
                  <span className="pr-12 block paragraph-text text-xs">Fee</span>{" "}
                  <span className="block">£{event.price}</span>
                </div>
              </div>

              <div>
                <span className="block paragraph-text text-xs">Location</span>{" "}
                <span className="block">{event.location}</span>
              </div>

              <div>
                <span className="block paragraph-text text-xs">Date & Time</span>{" "}
                <span className="block">{formatDate(event.date_time)}</span>
              </div>
            </div>
          </div>
    
        <section className="w-full mt-8 md:mt-14 ">
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
              <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                <div>
                  <Label className="w-full" htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
                  />
                </div>

                <div>
                  <Label className="w-full" htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className="bg-gray-200 h-14 border-none rounded-xl mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="special_requirements">Special Requirements</Label>
                  <Textarea
                    id="special_requirements"
                    value={bookingForm.special_requirements}
                    onChange={(e) => handleInputChange("special_requirements", e.target.value)}
                    placeholder="Any injuries, dietary requirements, or other notes..."
                    className="bg-gray-200 h-14 border-none rounded-xl mt-1"
                    rows={3}
                  />
                </div>
                <div></div>
                <div className="w-full flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-fit px-8 h-14 bg-[#F7BA4C] font-medium rounded-xl"
                  >
                    {isSubmitting ? "Redirecting to Payment..." : `Proceed To Payment`}
                  </Button>
                </div>
              </form>
            )}
     
        </section>
 
    </main>
  )
}
