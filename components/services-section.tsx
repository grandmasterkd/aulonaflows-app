"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const services = [
  {
    title: "Yoga Classes",
    description:
      "From gentle Hatha to dynamic Vinyasa flows, our classes cater to all levels and abilities. Experience the transformative power of mindful movement in a supportive, non-judgmental environment where every body is welcome.",
    image: "/services-temp-1.jpg",
  },
  {
    title: "Sound Therapy",
    description:
      "Immerse yourself in healing vibrations through crystal singing bowls, gongs, and other sacred instruments. These deeply relaxing sessions help reduce stress, improve sleep, and restore energetic balance.",
    image: "/services-temp-2.jpg",
  },
  {
    title: "Wellness Events",
    description:
      "Join our special workshops, retreats, and community gatherings designed to deepen your practice and connect with like-minded souls. From meditation intensives to seasonal celebrations, there's always something inspiring happening.",
    image: "/services-temp-3.jpg",
  },
  {
    title: "Corporate & Private Bookings",
    description:
      "Bring the benefits of yoga and mindfulness to your workplace or special event. Our customized sessions help reduce stress, improve focus, and create a more harmonious environment for teams and individuals.",
    image: "/services-temp-4.jpg",
  },
]

export function ServicesSection() {
  const [currentService, setCurrentService] = useState(0)

  const nextService = () => {
    setCurrentService((prev) => (prev + 1) % services.length)
  }

  const prevService = () => {
    setCurrentService((prev) => (prev - 1 + services.length) % services.length)
  }

  return (
    <section className="min-h-screen grid place-items-center px-8 md:px-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image */}
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src={services[currentService].image || "/placeholder.svg"}
              alt={services[currentService].title}
              width={600}
              height={450}
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          {/* Right Column - Content */}
          <div className="h-full flex flex-col justify-between gap-y-8">
            {/* Services header with line */}
            <div className="flex items-center gap-4">
              <span className="headline-text text-xs text-black font-semibold uppercase tracking-widest">Services</span>
              <div className="flex-1 h-px bg-[#C6A789]" />
            </div>

           <div className="space-y-4" >
            <h2 className="headline-text leading-normal text-4xl font-semibold">{services[currentService].title}</h2>      
            <p className="paragraph-text text-sm leading-relaxed">{services[currentService].description}</p>
           </div>
            

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={prevService} className="hidden rounded-full bg-transparent">
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex gap-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentService(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentService === index ? "bg-[#654625]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button variant="outline" size="icon" onClick={nextService} className="hidden rounded-full bg-transparent">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
