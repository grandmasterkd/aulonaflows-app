"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const aboutContent = [
  {
    title: "Hi I'm Aulona",
    content:
      "Welcome to my world of mindful movement and inner transformation. I'm passionate about creating a safe, nurturing space where you can explore the depths of your practice and discover the profound connection between mind, body, and spirit.",
  },
  {
    title: "My Journey",
    content:
      "My path to yoga began over a decade ago during a challenging period in my life. What started as a search for physical healing evolved into a profound spiritual awakening. I've trained extensively in various yoga traditions, sound healing, and mindfulness practices across India, Bali, and the UK.",
  },
  {
    title: "My Approach",
    content:
      "I believe yoga is not about perfect poses but about perfect presence. My teaching style blends traditional wisdom with modern understanding, creating accessible practices that honor both ancient traditions and contemporary needs. Every class is designed to meet you exactly where you are.",
  },
  {
    title: "My Philosophy",
    content:
      "True transformation happens when we turn inward with compassion and curiosity. Through breath, movement, and mindful awareness, we can unlock our innate wisdom and create lasting positive change in our lives and communities.",
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
    <section id="about-section" className="min-h-screen px-8 md:px-16 overflow-hidden">
      <div className="container mx-auto">
        {/* Page 1: Hi I'm Aulona & My Journey */}
        {currentPage === 0 && (
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
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[0].title}</h2>
                <p className="w-full md:max-w-lg paragraph-text text-sm leading-relaxed">{aboutContent[0].content}</p>
              </div>

              {/* Container 2 - My Journey */}
              <div
                className={`space-y-4 transition-all duration-700 delay-400 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[1].title}</h2>
                <p className="w-full md:max-w-lg paragraph-text text-sm leading-relaxed">{aboutContent[1].content}</p>
              </div>
            </div>

            {/* Right Column - Stacked Images */}
            <div className="relative mt-0 md:mt-24 min-h-screen flex flex-col items-start justify-center">
              <div className="relative w-96 h-[500px]">
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
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform translate-x-32 -translate-y-16">
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
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform translate-x-64 -translate-y-32">
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
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[2].title}</h2>
                <p className="w-full md:max-w-lg paragraph-text text-sm leading-relaxed">{aboutContent[2].content}</p>
              </div>

              {/* Container 2 - My Journey */}
              <div
                className={`space-y-4 transition-all duration-700 delay-400 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[3].title}</h2>
                <p className="w-full md:max-w-lg paragraph-text text-sm leading-relaxed">{aboutContent[3].content}</p>
              </div>
            </div>

            {/* Right Column - Stacked Images */}
            <div className="relative mt-0 md:mt-24 min-h-screen flex flex-col items-end justify-center">
              <div className="relative w-96 h-[500px]">
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
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform -translate-x-32 -translate-y-16">
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
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transform -translate-x-64 -translate-y-8">
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
        <div className="flex justify-center items-center gap-4 mt-0">
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
