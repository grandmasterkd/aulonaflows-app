"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search } from "lucide-react"

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

interface Bundle {
  id: string
  name: string
  description: string
  discount_percentage: number
  total_price: number
  status: string
  events: Event[]
}

export default function BookingOverviewPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeFilter, setActiveFilter] = useState("All Events")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const filters = ["All Events", "Bundles", "Yoga Classes", "Sound Therapy", "Wellness Events"]

  useEffect(() => {
    fetchEvents()
    fetchBundles()
  }, [])



  const filterEvents = useCallback(() => {
    let filtered = events

    if (activeFilter !== "All Events") {
      filtered = filtered.filter((event) => event.category === activeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredEvents(filtered)
  }, [events, activeFilter, searchQuery])

  useEffect(() => {
    filterEvents()
  }, [filterEvents])

  const fetchEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .gte("date_time", new Date().toISOString())
      .order("date_time", { ascending: true })

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      // Ensure image_url is a full URL
      const eventsWithUrls = (data || []).map(event => {
        if (event.image_url && !event.image_url.startsWith('http')) {
          event.image_url = supabase.storage.from('uploads').getPublicUrl(event.image_url).data.publicUrl
        }
        return event
      })
      setEvents(eventsWithUrls)
    }
    setIsLoading(false)
  }

  const fetchBundles = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("event_bundles")
      .select(`
        *,
        bundle_events (
          events (*)
        )
      `)
      .eq("status", "active")

    if (error) {
      console.error("Error fetching bundles:", error)
    } else {
      const formattedBundles = (data || []).map(bundle => ({
        ...bundle,
        events: bundle.bundle_events?.map((be: any) => be.events) || []
      }))
      setBundles(formattedBundles)
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

  const isFullyBooked = (event: Event) => {
    return event.current_bookings >= event.capacity
  }



  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse"><Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} /></div>
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      

      <section className="py-20 px-8 md:px-36">

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Left Column */}
            <div className="space-y-4 md:space-y-6">
              <Link href="/" className="inline-flex items-center gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
                <ArrowLeft size={20} />
                Back
              </Link>
              <h1 className="headline-text max-w-md leading-normal md:leading-normal text-4xl md:text-5xl font-bold">Begin Your Journey Inward Today</h1>
              <div className="relative">
                <Input
                  placeholder="Search for classes, workshops, or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none bg-gray-100 rounded-full w-full md:w-[80%] h-14 text-base indent-10"
                />
                <Search className="size-5 absolute left-6 top-4" />
              </div>
            </div>

            {/* Right Column */}
            <div className="aspect-[4/3] bg-gray-200 rounded-3xl overflow-hidden">
              <Image
                src="/aulona-bookings.webp"
                alt="Previous yoga events"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Body Section */}
      <section className="pb-8 md:pb-0 py-0 md:py-16 px-8 md:px-36">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* Filter Toggle */}
          <div className="flex justify-center">
            <div className="w-full md:w-fit overflow-x-auto relative bg-gray-200 rounded-full p-1.5 flex">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-full text-xs md:text-sm whitespace-nowrap font-medium transition-all ${
                    activeFilter === filter ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-0 md:pb-12">
            {activeFilter === "Bundles" ? bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="cursor-pointer bg-gray-200 rounded-3xl border-none overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className="h-80 bg-cover relative"
                >
                  <Image src="/aulona-yoga-services.webp" alt='' layout="fill" objectFit="cover" className="w-full h-80 object-cover" />
                  <div className="absolute inset-0 transition-colors" />
                      <div className="absolute top-5 left-5 z-50" >
                    <span className="bg-gradient-to-tr from-[#E3C9A3] to-[#57463B] backdrop-blur-sm border border-white/50 text-[#FFF0D8] font-medium rounded-full w-fit px-4 py-2 text-xs" >Bundle </span> 
                    </div>
                  <div className="absolute bottom-0 left-0 right-0 text-white space-y-2 bg-gradient-to-t from-black via-black/100 to-black/0 p-6 rounded-b-xl">
                    <div className="mb-4" >
                    
                    <h3 className="text-xl text-white font-medium">{bundle.name}</h3>
                    <p className="text-xs text-gray-200">
                       {bundle.events.length} Events • Save {bundle.discount_percentage}%
                    </p>
                    </div>
                    <Link href={`/book/bundle/${bundle.id}`} className="cursor-pointer backdrop-blur-sm hover:shadow-sm hover:bg-[#57463B] hover:text-[#FFE7BB] transition duration-700 bg-white/20 border border-white/15 text-white text-sm grid place-items-center w-fit h-10 px-5 rounded-3xl" >Book Bundle</Link>
                  </div>
                </div>
                <CardContent className="hidden p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#654625]">£{bundle.total_price}</span>
                    <Link
                      href={`/book/bundle/${bundle.id}`}
                      className="brand-bg-brown brand-text-cream px-6 py-2 rounded-3xl font-medium hover:bg-opacity-90 transition-all"
                    >
                      Book Bundle
                    </Link>
                  </div>
                </CardContent>
              </div>
            )) : activeFilter === "All Events" ? [...filteredEvents.map((event) => (
              <div
                key={event.id}
                className="cursor-pointer bg-gray-200 rounded-3xl border-none overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className="h-80 bg-cover relative"
                >
                  <Image src={event.image_url || "/diverse-yoga-class.png"} alt='' layout="fill" objectFit="cover" className="w-full h-80 object-cover" />
                  <div className="absolute inset-0 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 text-white space-y-2 bg-gradient-to-t from-black via-black/100 to-black/0 p-6 rounded-b-xl">
                    <div className="mb-4" >
                    <h3 className="text-xl text-white font-medium">{event.name}</h3>
                    <p className="text-xs text-gray-200">
                       {formatDate(event.date_time)}
                    </p>
                    </div>
                    <Link href={`/book/${event.id}`} className="cursor-pointer backdrop-blur-sm hover:shadow-sm hover:bg-[#57463B] hover:text-[#FFE7BB] transition duration-700 bg-white/20 border border-white/15 text-white text-sm grid place-items-center w-fit h-10 px-5 rounded-3xl" >Book Now</Link>
                  </div>
                  {isFullyBooked(event) && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Fully Booked
                    </div>
                  )}
                </div>
                <CardContent className="hidden p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(event.date_time)}
                    </p>
                    <p className="text-xs text-gray-200 line-clamp-1">{event.description}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {event.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {event.instructor_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Spaces:</span> {event.current_bookings}/{event.capacity}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#654625]">£{event.price}</span>
                    {!isFullyBooked(event) ? (
                      <Link
                        href={`/book/${event.id}`}
                        className="brand-bg-brown brand-text-cream px-6 py-2 rounded-3xl font-medium hover:bg-opacity-90 transition-all"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <span className="text-gray-500 px-6 py-2 rounded-3xl font-medium border border-gray-300">
                        Fully Booked
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>
            )), ...bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="cursor-pointer bg-gray-200 rounded-3xl border-none overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className="h-80 bg-cover relative"
                >
                  <Image src="/aulona-yoga-services.webp" alt='' layout="fill" objectFit="cover" className="w-full h-80 object-cover" />
                  <div className="absolute inset-0 transition-colors" />
                   <div className="absolute top-5 left-5 z-50" >
                    <span className="bg-gradient-to-tr from-[#E3C9A3] to-[#57463B] backdrop-blur-sm border border-white/50 text-[#FFF0D8] font-medium rounded-full w-fit px-4 py-2 text-xs" >Bundle </span> 
                    </div>
                  <div className="absolute bottom-0 left-0 right-0 text-white space-y-2 bg-gradient-to-t from-black via-black/100 to-black/0 p-6 rounded-b-xl">
                    <div className="mb-4" >
                    <h3 className="text-xl text-white font-medium">{bundle.name}</h3>
                    <p className="text-xs text-gray-200">
                       {bundle.events.length} Events • Save {bundle.discount_percentage}%
                    </p>
                    </div>
                    <Link href={`/book/bundle/${bundle.id}`} className="cursor-pointer backdrop-blur-sm hover:shadow-sm hover:bg-[#57463B] hover:text-[#FFE7BB] transition duration-700 bg-white/20 border border-white/15 text-white text-sm grid place-items-center w-fit h-10 px-5 rounded-3xl" >Book Bundle</Link>
                  </div>
                </div>
                <CardContent className="hidden p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#654625]">£{bundle.total_price}</span>
                    <Link
                      href={`/book/bundle/${bundle.id}`}
                      className="brand-bg-brown brand-text-cream px-6 py-2 rounded-3xl font-medium hover:bg-opacity-90 transition-all"
                    >
                      Book Bundle
                    </Link>
                  </div>
                </CardContent>
              </div>
            ))] : filteredEvents.map((event) => (
              <div
                key={event.id}
                className="cursor-pointer bg-gray-200 rounded-3xl border-none overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className="h-80 bg-cover relative"
                >
                  <Image src={event.image_url || "/diverse-yoga-class.png"} alt='' layout="fill" objectFit="cover" className="w-full h-80 object-cover" />
                  <div className="absolute inset-0 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 text-white space-y-2 bg-gradient-to-t from-black via-black/100 to-black/0 p-6 rounded-b-xl">
                    <div className="mb-4" >
                    <h3 className="text-xl text-white font-medium">{event.name}</h3>
                    <p className="text-xs text-gray-200">
                       {formatDate(event.date_time)}
                    </p>
                    </div>
                    <Link href={`/book/${event.id}`} className="cursor-pointer backdrop-blur-sm hover:shadow-sm hover:bg-[#57463B] hover:text-[#FFE7BB] transition duration-700 bg-white/20 border border-white/15 text-white text-sm grid place-items-center w-fit h-10 px-5 rounded-3xl" >Book Now</Link>
                  </div>
                  {isFullyBooked(event) && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Fully Booked
                    </div>
                  )}
                </div>
                <CardContent className="hidden p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(event.date_time)}
                    </p>
                    <p className="text-xs text-gray-200 line-clamp-1">{event.description}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {event.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {event.instructor_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Spaces:</span> {event.current_bookings}/{event.capacity}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#654625]">£{event.price}</span>
                    {!isFullyBooked(event) ? (
                      <Link
                        href={`/book/${event.id}`}
                        className="brand-bg-brown brand-text-cream px-6 py-2 rounded-3xl font-medium hover:bg-opacity-90 transition-all"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <span className="text-gray-500 px-6 py-2 rounded-3xl font-medium border border-gray-300">
                        Fully Booked
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>
            ))}
          </div>

           {((activeFilter === "Bundles" && bundles.length === 0) ||
             (activeFilter === "All Events" && filteredEvents.length === 0 && bundles.length === 0) ||
             (activeFilter !== "All Events" && activeFilter !== "Bundles" && filteredEvents.length === 0)) && (
             <div className="text-center py-16">
               <p className="text-xl text-gray-600">No events or bundles found matching your criteria.</p>
               <p className="text-gray-500 mt-2">Try adjusting your search or filter options.</p>
             </div>
           )}
        </div>
      </section>


    </div>
  )
}
