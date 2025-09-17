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
    <main className="min-h-screen mx-auto grid place-items-center px-8 md:px-4 py-12 md:py-0">
      <section className="max-w-4xl ">
        {/* Back Button */}
        <Link href="/book" className="inline-flex items-center gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
            <div
              className="h-[400px] md:h-full bg-cover bg-gray-200 rounded-3xl"
              style={{
                backgroundImage: `url(${event.image_url || "/diverse-yoga-class.png"})`,
              }}
            >      
            </div>
         

    
          <div>
             <div className="w-full flex flex-col items-start gap-y-6 md:gap-y-4">
              <div>
                <h1 className="headline-text leading-normal lg:leading-normal md:leading-normal text-3xl md:text-4xl lg:text-5xl font-bold">{event.name}</h1>     
                <p className="paragraph-text text-sm md:text-base leading-relaxed">{event.description}</p>
              </div>
              

              <span className="w-full h-0.5 bg-gray-200 " ></span>
              
                <div className="w-full flex items-start justify-between" >
                  <div>
                  <span className="block paragraph-text text-xs">Instructor</span> <span className="block" >{event.instructor_name}</span>
                  </div>

                <div>
                <span className="pr-12 block paragraph-text text-xs">Fee</span> <span className="block" >£{event.price}</span>
                </div>
                              
                
                </div>
               

                <div>
                  <span className="block paragraph-text text-xs">Location</span> <span className="block" >{event.location}</span>
                </div>

                <div>
                  <span className="block paragraph-text text-xs">Date & Time</span> <span className="block" >{formatDate(event.date_time)}</span>
                </div>
               
                {/* <p>
                  <span className="font-medium">Spaces:</span> Available/{event.capacity}
                  <p className="text-sm opacity-90">{event.category}</p>
                </p> */}
               
              </div>
            
          </div>
           </div>
          <section className="mt-8 md:mt-14 " >
           
            <div >
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-gray-200 h-14 border-none rounded-xl mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="bg-gray-200 h-14 border-none rounded-xl mt-1"
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
                  <div className="w-full flex justify-end" >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-fit px-8 h-14 bg-[#F7BA4C] font-medium rounded-xl"
                  >
                    {isSubmitting ? "Processing..." : `Proceed To Payment`}
                  </Button>
                  </div>
                 
                </form>
              )}
            </div>
          </section>
       
      </section>
    </main>
  )
}
