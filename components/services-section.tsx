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
    image: "/placeholder-4h0lf.png",
  },
  {
    title: "Sound Therapy",
    description:
      "Immerse yourself in healing vibrations through crystal singing bowls, gongs, and other sacred instruments. These deeply relaxing sessions help reduce stress, improve sleep, and restore energetic balance.",
    image: "/placeholder-iwye8.png",
  },
  {
    title: "Wellness Events",
    description:
      "Join our special workshops, retreats, and community gatherings designed to deepen your practice and connect with like-minded souls. From meditation intensives to seasonal celebrations, there's always something inspiring happening.",
    image: "/placeholder-ki482.png",
  },
  {
    title: "Corporate & Private Bookings",
    description:
      "Bring the benefits of yoga and mindfulness to your workplace or special event. Our customized sessions help reduce stress, improve focus, and create a more harmonious environment for teams and individuals.",
    image: "/placeholder-r5jlq.png",
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
    <section className="py-20 px-8 md:px-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image */}
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <Image
              src={services[currentService].image || "/placeholder.svg"}
              alt={services[currentService].title}
              width={600}
              height={450}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            {/* Services header with line */}
            <div className="flex items-center gap-4">
              <span className="paragraph-text text-sm uppercase tracking-wider">Services</span>
              <div className="flex-1 h-px bg-[#C6A789]" />
            </div>

            {/* Service Title */}
            <h2 className="headline-text text-4xl md:text-5xl font-bold">{services[currentService].title}</h2>

            {/* Service Description */}
            <p className="paragraph-text text-lg leading-relaxed">{services[currentService].description}</p>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={prevService} className="rounded-full bg-transparent">
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

              <Button variant="outline" size="icon" onClick={nextService} className="rounded-full bg-transparent">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
