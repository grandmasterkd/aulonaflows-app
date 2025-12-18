"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PhoneInput } from "@/components/PhoneInput"
import Link from "next/link"
import { ArrowLeft, AlertCircle, X } from "lucide-react"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"

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
  phoneValid: boolean
  has_health_conditions: boolean
  health_conditions: string
  agreed_to_terms: boolean
}

export default function BookEventPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    phoneValid: false,
    has_health_conditions: false,
    health_conditions: "",
    agreed_to_terms: false,
  })
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (params.id && user) {
      fetchEvent(params.id as string)
    }

    if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Payment was cancelled. Please try again." })
    }
  }, [params.id, searchParams, user])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const checkAuthentication = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to signup with return URL
      const returnUrl = encodeURIComponent(`/book/${params.id}`)
      router.push(`/auth/register?returnUrl=${returnUrl}`)
      return
    }

    setUser(user)

    // Optionally pre-fill form with user data
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', user.id)
      .single()

    if (profile) {
      setBookingForm(prev => ({
        ...prev,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || user.email || "",
        phone: profile.phone || "",
      }))
    } else {
      setBookingForm(prev => ({
        ...prev,
        email: user.email || "",
      }))
    }
  }

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

  const handleInputChange = (field: keyof BookingForm, value: string | boolean) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhoneChange = (phone: string, phoneValid: boolean) => {
    setBookingForm((prev) => ({
      ...prev,
      phone,
      phoneValid,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    if (!bookingForm.phoneValid) {
      setMessage({ type: "error", text: "Please enter a valid phone number." })
      return
    }

    if (!bookingForm.agreed_to_terms) {
      setMessage({ type: "error", text: "Please agree to the Terms and Conditions before proceeding." })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const bookingData = {
        user_id: user?.id,
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        has_health_conditions: bookingForm.has_health_conditions,
        health_conditions: bookingForm.health_conditions || "",
        agreed_to_terms: bookingForm.agreed_to_terms,
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
        console.log(response)
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
    <main className="relative min-h-screen w-full grid place-items-center px-8 md:px-24 lg:px-36 py-12">
    
        {/* Back Button */}
        <div className="w-full" >
          <Link href="/book" className="w-fit inline-flex text-left gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
        </div>

        <div className="absolute mx-auto z-20 top-20">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 w-fit ${
               message.type === "error"
               ? "bg-red-500/85 backdrop-blur-sm text-red-50 border border-red-200"
               : "bg-green-500 text-green-50 border border-green-200"
                }`}
              >
                    {message.type === "error" && <AlertCircle size={20} />}
              <span className="whitespace-nowrap text-sm" >{message.text}</span>
            </div>
          )}
        </div>
        

        <div className="w-full grid lg:grid-cols-2 gap-8">
          <div className="relative h-[400px] lg:h-full bg-gray-200 rounded-3xl overflow-hidden">
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
    
        <section className="w-full mt-10 ">
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
              <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
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
                  <PhoneInput
                    value={bookingForm.phone}
                    onChange={handlePhoneChange}
                    required
                    className="mt-1"
                  />
                </div>

                 <div>
                   <Label>Do you have any health conditions?</Label>
                   <div className="flex gap-4 mt-1">
                     <label className="flex items-center gap-2">
                       <input
                         type="radio"
                         name="health_conditions"
                         checked={!bookingForm.has_health_conditions}
                         onChange={() => handleInputChange("has_health_conditions", false)}
                         className="w-4 h-4"
                       />
                       No
                     </label>
                     <label className="flex items-center gap-2">
                       <input
                         type="radio"
                         name="health_conditions"
                         checked={bookingForm.has_health_conditions}
                         onChange={() => handleInputChange("has_health_conditions", true)}
                         className="w-4 h-4"
                       />
                       Yes
                     </label>
                   </div>
                   {bookingForm.has_health_conditions && (
                     <Textarea
                       id="health_conditions"
                       value={bookingForm.health_conditions}
                       onChange={(e) => handleInputChange("health_conditions", e.target.value)}
                       placeholder="Please describe your health conditions..."
                       className="bg-gray-200 border-none rounded-xl mt-2"
                       rows={3}
                     />
                   )}
                 </div>
             
                 <div className="mt-4 w-full">
                   <label className="flex items-center gap-2">
                     <input
                       type="checkbox"
                       checked={bookingForm.agreed_to_terms}
                       onChange={(e) => handleInputChange("agreed_to_terms", e.target.checked)}
                       className="w-4 h-4"
                     />
                     <span className="text-sm">
                       I have read and agree to the{" "}
                       <button
                         type="button"
                         onClick={() => setIsTermsModalOpen(true)}
                         className="text-[#654625] underline hover:text-[#4a3319]"
                       >
                         Terms and Conditions
                       </button>
                     </span>
                   </label>
                   
                   <div className="mt-3" > 
                    <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full px-8 h-14 bg-[#F7BA4C] font-medium rounded-xl"
                   >
                     {isSubmitting ? "Redirecting to Payment..." : `Proceed To Payment`}
                   </Button>
                   </div>
                 
                  </div>

                   
              
              </form>
            )}
     
         </section>

         {/* Terms and Conditions Modal */}
         {isTermsModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsTermsModalOpen(false)}>
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <div
               onClick={(e) => e.stopPropagation()}
               className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-500 ease-out"
             >
               <div className="sticky top-0 bg-white px-6 py-5 flex items-center justify-between z-10">
                 <h3 className="headline-text text-xl md:text-2xl font-semibold text-[#654625]">Terms and Conditions</h3>
                 <button
                   onClick={() => setIsTermsModalOpen(false)}
                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                   aria-label="Close modal"
                 >
                   <X className="w-5 h-5 text-gray-600" />
                 </button>
               </div>
               <div className="px-6 py-4 pb-8 overflow-y-auto max-h-[calc(85vh-80px)]">
                 <div className="prose prose-sm md:prose-base max-w-none leading-relaxed space-y-4">
                   <p>Before booking your class, please take a moment to read the terms below. This helps create a safe and supportive space for everyone.</p>
                   <ul className="list-disc pl-5 space-y-2">
                     <li>Classes can be rescheduled up to 24 hours before the start time. After this window, bookings cannot be changed or moved.</li>
                     <li>No refunds will be issued once a booking is confirmed.</li>
                     <li>Please listen to your body throughout the class everything offered is simply an invitation. Rest or modify whenever you need.</li>
                     <li>If you have any injuries or medical conditions, please inform your teacher before class so suitable adjustments can be made.</li>
                     <li>Classes are not suitable for pregnancy.</li>
                     <li>By attending, you acknowledge that you are participating at your own risk and take full responsibility for your wellbeing during the session.</li>
                     <li>Please take care of your personal belongings — the teacher and studio cannot be held responsible for any loss or damage.</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         )}
     </main>
   )
}
