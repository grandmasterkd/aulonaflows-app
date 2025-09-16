"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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

export default function BookingOverviewPage() {
  const [classes, setClasses] = useState<YogaClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<YogaClass[]>([])
  const [activeFilter, setActiveFilter] = useState("All Events")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const filters = ["All Events", "Yoga Classes", "Workshops", "Sound Baths"]

  useEffect(() => {
    fetchClasses()
  }, [])

  const filterClasses = useCallback(() => {
    let filtered = classes

    // Apply category filter - for now, treat all as yoga classes
    if (activeFilter !== "All Events") {
      // Since we only have yoga_classes table, we'll show all for any filter
      // In a real implementation, you might filter by class_type
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (yogaClass) =>
          yogaClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (yogaClass.description && yogaClass.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredClasses(filtered)
  }, [classes, activeFilter, searchQuery])

  useEffect(() => {
    filterClasses()
  }, [filterClasses])

  const fetchClasses = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("yoga_classes")
      .select(`
        *,
        instructors(name),
        class_types(name)
      `)
      .eq("status", "active")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching classes:", error)
    } else {
      const transformedData = (data || []).map((item) => ({
        ...item,
        instructor_name: item.instructors?.name || "TBA",
        class_type_name: item.class_types?.name || "Yoga Class",
      }))
      setClasses(transformedData)
    }
    setIsLoading(false)
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

  const isFullyBooked = (yogaClass: YogaClass) => {
    return yogaClass.current_bookings >= yogaClass.max_capacity
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-8 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <h1 className="headline-text text-4xl md:text-5xl font-bold">Begin Your Journey Inward Today</h1>
              <div className="relative">
                <Input
                  placeholder="Search for classes, workshops, or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-3xl px-6 py-4 text-lg border-2 border-[#C6A789] focus:border-[#654625]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
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
      <section className="py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Filter Toggle */}
          <div className="flex justify-center">
            <div className="relative bg-gray-100 rounded-3xl p-1 flex">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-3xl text-sm font-medium transition-all ${
                    activeFilter === filter ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((yogaClass) => (
              <Card key={yogaClass.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div
                  className="h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(/placeholder.svg?height=256&width=384&query=yoga class)`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute bottom-4 left-4 text-white space-y-2">
                    <h3 className="text-xl font-bold">{yogaClass.title}</h3>
                    <p className="text-sm opacity-90 line-clamp-2">{yogaClass.description}</p>
                  </div>
                  {isFullyBooked(yogaClass) && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Fully Booked
                    </div>
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(yogaClass.start_time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {yogaClass.class_type_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {yogaClass.instructor_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Spaces:</span> {yogaClass.current_bookings}/{yogaClass.max_capacity}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#654625]">£{yogaClass.price}</span>
                    {!isFullyBooked(yogaClass) ? (
                      <Link
                        href={`/book/${yogaClass.id}`}
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
              </Card>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No classes found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter options.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
