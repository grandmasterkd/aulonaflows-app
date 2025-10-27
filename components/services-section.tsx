"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const services = [
  {
    title: "Yoga Classes",
    description:
      "From gentle Hatha to dynamic Vinyasa flows, our classes cater to all levels and abilities. Experience the transformative power of mindful movement in a supportive, non-judgmental environment where every body is welcome.",
    image: "/aulona-personal-13.webp",
  },
  {
    title: "Sound Therapy",
    description:
      "Immerse yourself in healing vibrations through crystal singing bowls, and other sacred instruments. These deeply relaxing sessions help reduce stress, improve sleep, and restore energetic balance.",
    image: "/aulona-personal-6.webp",
  },
  {
    title: "Wellness Events",
    description:
      "Join our special workshops, retreats, and community gatherings designed to deepen your practice and connect with like-minded souls. From meditation intensives to seasonal celebrations, there's always something inspiring happening.",
    image: "/aulona-personal-14.webp",
  },
  {
    title: "Corporate & Private Bookings",
    description:
      "Bring the benefits of yoga and mindfulness to your workplace or special event. Our customized sessions help reduce stress, improve focus, and create a more harmonious environment for teams and individuals.",
    image: "/aulona-personal-15.webp",
  },
]

export function ServicesSection() {
  const [currentService, setCurrentService] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const nextService = () => {
    setCurrentService((prev) => (prev + 1) % services.length)
  }

  const prevService = () => {
    setCurrentService((prev) => (prev - 1 + services.length) % services.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextService()
    } else if (isRightSwipe) {
      prevService()
    }

    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <section
      ref={sectionRef}
      className="py-4 pb-8 md:pb-0 md:py-0 h-auto md:min-h-screen grid place-items-center px-8 md:px-24 lg:px-44"
    >
      <div className="container mx-auto">
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Column - Image */}
          <section
            className={`transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`h-[400px] md:h-[580px] rounded-3xl overflow-hidden transition-transform duration-200 ${isDragging ? "scale-[0.98]" : ""}`}
            >
              <Image
                src={services[currentService].image || "/placeholder.svg"}
                alt={services[currentService].title}
                width={500}
                height={450}
                className="w-full h-full object-cover rounded-3xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="mt-8 flex md:hidden justify-center items-center gap-4 pb-8">
              <div className="flex gap-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentService(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                      currentService === index ? "bg-[#654625] scale-110" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Right Column - Content */}
          <div className="h-full flex flex-col justify-between md:justify-around gap-y-8 md:gap-y-12">
            {/* Services header with line */}
            <div
              className={`flex items-center gap-4 transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <span className="headline-text text-xs text-black font-semibold uppercase tracking-widest">Services</span>
              <div
                className="flex-1 h-px bg-[#C6A789] transform origin-left transition-transform duration-1000"
                style={{
                  transform: isVisible ? "scaleX(1)" : "scaleX(0)",
                  transitionDelay: "600ms",
                }}
              />
            </div>

            <div
              className={`space-y-8 md:space-y-12 transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="space-y-3 md:space-y-4">
                <h2 className="headline-text leading-normal md:leading-normal text-2xl md:text-4xl font-semibold transition-all duration-500">
                  {services[currentService].title}
                </h2>
                <p className="paragraph-text text-sm md:text-base leading-relaxed transition-all duration-500">
                  {services[currentService].description}
                </p>
              </div>

              <Link href="/book" className="flex items-center gap-x-1.5 group w-fit">
                <div className="w-fit rounded-full p-1.5 h-auto bg-transparent border-2 border-[#FDC7AA] transition-all duration-300 group-hover:border-[#FFB366] group-hover:shadow-lg">
                  <Button
                    className="border border-[#FFBE5D] rounded-3xl px-4 md:px-6 py-5 text-xs font-medium transition-all duration-300 flex items-center gap-2 hover:shadow-md transform group-hover:scale-105"
                    style={{
                      background: "linear-gradient(90deg, #FFE3E1 0%, #FFD3B3 53%, #FFDDB9 100%)",
                      color: "#654625",
                    }}
                  >
                    BOOK A CLASS
                  </Button>
                </div>
                <div className="bg-[#FFDDB9] h-12 w-12 md:h-14 md:w-14 p-2 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-[#FFB366] group-hover:shadow-lg transform group-hover:scale-105 group-hover:rotate-3">
                  <ChevronRight className="text-[#A56024] size-7 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <div
              className={`hidden md:flex items-center gap-4 pb-8 transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "800ms" }}
            >
              <div className="flex gap-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentService(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                      currentService === index ? "bg-[#654625] scale-110" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
