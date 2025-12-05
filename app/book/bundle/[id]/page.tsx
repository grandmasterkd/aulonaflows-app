"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MapPin, User, Phone, X } from "lucide-react"
import { calculateBundlePrice } from "@/lib/utils/bundles"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PhoneInput } from "@/components/PhoneInput"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const bundleId = params.id as string
  const eventIds = searchParams.get('events')?.split(',') || []

  const [bundle, setBundle] = useState<Bundle | null>(null)
    console.log("dunbleData:",bundle)
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  console.log("se:",selectedEvents)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    has_health_conditions: false,
    health_conditions: "",
    agreed_to_terms: false,
  })

  const isFullyBooked = () => {
    return false
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhoneChange = (phone: string, phoneValid: boolean) => {
    setFormData((prev) => ({
      ...prev,
      phone,
      phoneValid,
    }))
  }

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBundle()
    }
  }, [bundleId, user])

  const checkAuthentication = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to signup with return URL
      const returnUrl = encodeURIComponent(`/book/bundle/${bundleId}?events=${eventIds.join(',')}`)
      router.push(`/auth/register?returnUrl=${returnUrl}`)
      return
    }

    setUser(user)

    // Pre-fill form with user data
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', user.id)
      .single()

    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || user.email || "",
        phone: profile.phone || "",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
      }))
    }
  }

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
    
      const formatImage = bundleData?.events?.map((img: any) => {
          if(img.image_url || img.startsWith('http'))   {     
       img.image_url = supabase.storage.from('uploads').getPublicUrl(img.image_url).data.publicUrl } return img
      })
    
      setBundle({...bundleData, events: formatImage})
      setSelectedEvents(bundleData.events)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "Please fill in all required fields." })
      setIsSubmitting(false)
      return
    }

    if (!formData.agreed_to_terms) {
      setMessage({ type: "error", text: "Please agree to the Terms and Conditions before proceeding." })
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bundleId: bundleId,
          bookingData: {
            user_id: user?.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            has_health_conditions: formData.has_health_conditions,
            health_conditions: formData.health_conditions,
            agreed_to_terms: formData.agreed_to_terms,
          },
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
      console.error("Error creating payment session:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create payment session. Please try again."
      })
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

      <div className="max-w-4xl mx-auto px-0 py-8">
        <div className="grid grid-cols-1 gap-y-8">
          {/* Bundle Details */}
          <div className="space-y-6">      
              {/* <CardHeader>
                <CardTitle>Events in This Bundle</CardTitle>
              </CardHeader> */}
              <CardContent className="space-y-4">
                {selectedEvents.map((event) => (                
                  <div key={event.id} className="rounded-xl p-4 bg-white border border-black/5 flex flex-col lg:flex-row items-start gap-3">               
                  <Image src={event.image_url} alt={event.name} width={200} height={200} style={{ objectFit: "cover" }} className="rounded-xl aspect-square" />   
                  <div>
                     <h1 className="font-semibold headline-text font-header text-lg">{event.name}</h1>
                    <p className="paragraph-text text-sm md:text-base leading-relaxed">{event.description}</p>
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
                   
                  </div>
                ))}
              </CardContent>
            

            {/* Pricing */}
            <div>
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
                    value={formData.name}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    value={formData.phone}
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
                         checked={!formData.has_health_conditions}
                         onChange={() => handleInputChange("has_health_conditions", false)}
                         className="w-4 h-4"
                       />
                       No
                     </label>
                     <label className="flex items-center gap-2">
                       <input
                         type="radio"
                         name="health_conditions"
                         checked={formData.has_health_conditions}
                         onChange={() => handleInputChange("has_health_conditions", true)}
                         className="w-4 h-4"
                       />
                       Yes
                     </label>
                   </div>
                   {formData.has_health_conditions && (
                     <Textarea
                       id="health_conditions"
                       value={formData.health_conditions}
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
                       checked={formData.agreed_to_terms}
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
                     {isSubmitting ? "Redirecting to Payment..." : `Proceed to Payment - £${pricing.discountedTotal.toFixed(2)}`}
                   </Button>
                   </div>
                 
                  </div>

                   
              
              </form>
            )}
     
         </section>
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
        </div>
      </div>
    </div>
  )
}