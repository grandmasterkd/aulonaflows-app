"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const aboutContent = [
  {
    title: "Hi I'm Aulona",
    content:
      "A Yoga Teacher and Sound Therapy Practitioner, but most importantly, someone who believes deeply in the power of self-healing.",
  },
  {
    title: "My Journey",
    content:
      "My personal path through growth and healing led me to create nurturing, sacred spaces where others cansafely release, reconnect, and restore balance.",
  },
  {
    title: "My Approach",
    content:
      "Through yoga, sound therapy, and mindfulness, I guide experiences designed to ground your body, calm your mind, and support emotional release. Every offering is rooted in softness, safety, and alignment.",
  },
  {
    title: "My Philosophy",
    content:
      "True healing starts when we slow down and listen—to our breath, our body, and the wisdom within. Everything you need is already inside you. I'm here to help you come home to it.",
  },
]

export function AboutSection() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("about-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % 2)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + 2) % 2)
  }

  return (
    <section id="about-section" className="min-h-screen grid place-items-center px-8 py-16 md:py-0 md:px-24 lg:px-44 overflow-hidden">
      <div className="container mx-auto]">
        {/* Page 1: Hi I'm Aulona & My Journey */}
        {currentPage === 0 && (
          <div
            className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Left Column - Text Containers */}
            <div className="space-y-12">
              {/* Container 1 - Hi I'm Aulona */}
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[0].title}</h2>
                <p className="w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed">{aboutContent[0].content}</p>
              </div>

              {/* Container 2 - My Journey */}
              <div
                className={`space-y-4 transition-all duration-700 delay-400 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[1].title}</h2>
                <p className="w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed">{aboutContent[1].content}</p>
              </div>
            </div>

            {/* Right Column - Stacked Images */}
            <div className="relative md:pr-44 pr-0 mt-0 pt-36 pb-16 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto relative w-72 md:w-96 h-[400px] md:h-[500px]">
                {/* Image 1 - Bottom layer, rotated left */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-300 ${
                    isVisible
                      ? "opacity-100 rotate-[-8deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[-15deg] translate-x-8 translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <Image
                      src="/aulona-temp-1.jpg"
                      alt="Aulona in meditation"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Image 2 - Middle layer, rotated right */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-500 ${
                    isVisible
                      ? "opacity-100 rotate-[6deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[12deg] -translate-x-8 translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform translate-x-2 -translate-y-10 md:translate-x-32 -md:translate-y-16">
                    <Image
                      src="/aulona-temp-2.jpg"
                      alt="Yoga studio"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Image 3 - Top layer, slight left rotation */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-700 ${
                    isVisible
                      ? "opacity-100 rotate-[-3deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[-8deg] translate-x-4 -translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform  translate-x-4 -translate-y-24 md:translate-x-64 -md:translate-y-32">
                    <Image
                      src="/aulona-temp-3.jpg"
                      alt="Aulona practicing yoga"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: My Approach & My Philosophy */}
        {currentPage === 1 && (
         <div
            className={`grid md:grid-cols-2 gap-0 items-center transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Left Column - Text Containers */}
            <div className="space-y-12">
              {/* Container 1 - Hi I'm Aulona */}
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[2].title}</h2>
                <p className="w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed">{aboutContent[2].content}</p>
              </div>

              {/* Container 2 - My Journey */}
              <div
                className={`space-y-4 transition-all duration-700 delay-400 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[3].title}</h2>
                <p className="w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed">{aboutContent[3].content}</p>
              </div>
            </div>

            {/* Right Column - Stacked Images */}
            <div className="relative md:pr-44 pr-0 mt-0 pt-36 pb-16 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto relative w-72 md:w-96 h-[400px] md:h-[500px]">
                {/* Image 1 - Bottom layer, rotated left */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-300 ${
                    isVisible
                      ? "opacity-100 rotate-[-4deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[-15deg] translate-x-8 translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <Image
                      src="/aulona-temp-4.jpg"
                      alt="Aulona in meditation"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Image 2 - Middle layer, rotated right */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-500 ${
                    isVisible
                      ? "opacity-100 rotate-[6deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[12deg] -translate-x-8 translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform translate-x-2 -translate-y-10 md:translate-x-32 -md:translate-y-16">
                    <Image
                      src="/aulona-temp-5.jpg"
                      alt="Yoga studio"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Image 3 - Top layer, slight left rotation */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 delay-700 ${
                    isVisible
                      ? "opacity-100 rotate-[-3deg] translate-x-0 translate-y-0"
                      : "opacity-0 rotate-[-8deg] translate-x-4 -translate-y-8"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform  translate-x-4 -translate-y-24 md:translate-x-64 -md:translate-y-32">
                    <Image
                      src="/aulona-temp-6.jpg"
                      alt="Aulona practicing yoga"
                      width={384}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-0 md:mt-24  mb-4 lg:mb-16">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            className="hidden rounded-full bg-transparent hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {[0, 1].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentPage === page ? "bg-[#654625] scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            className="hidden rounded-full bg-transparent hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
