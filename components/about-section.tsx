"use client"

import { useState } from "react"
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

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % 2)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + 2) % 2)
  }

  return (
    <section className="py-20 px-8 md:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Page 1: Hi I'm Aulona & My Journey */}
        {currentPage === 0 && (
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left Column - Text Containers */}
            <div className="space-y-12">
              {/* Container 1 - Hi I'm Aulona */}
              <div className="space-y-4">
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[0].title}</h2>
                <p className="paragraph-text text-lg leading-relaxed">{aboutContent[0].content}</p>
              </div>

              {/* Container 2 - My Journey */}
              <div className="space-y-4">
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[1].title}</h2>
                <p className="paragraph-text text-lg leading-relaxed">{aboutContent[1].content}</p>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/yoga-instructor-meditation.png"
                      alt="Aulona in meditation"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/yoga-studio-natural-light.png"
                      alt="Yoga studio"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="pt-8">
                  <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder-9hrr2.png"
                      alt="Aulona practicing yoga"
                      width={320}
                      height={400}
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
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left Column - Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="pt-8">
                  <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder-c1huf.png"
                      alt="Sound healing setup"
                      width={320}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder-ibdub.png"
                      alt="Group yoga class"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder-zyck8.png"
                      alt="Meditation space"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Text Containers */}
            <div className="space-y-12">
              {/* Container 3 - My Approach */}
              <div className="space-y-4">
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[2].title}</h2>
                <p className="paragraph-text text-lg leading-relaxed">{aboutContent[2].content}</p>
              </div>

              {/* Container 4 - My Philosophy */}
              <div className="space-y-4">
                <h2 className="headline-text text-3xl md:text-4xl font-bold">{aboutContent[3].title}</h2>
                <p className="paragraph-text text-lg leading-relaxed">{aboutContent[3].content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-16">
          <Button variant="outline" size="icon" onClick={prevPage} className="rounded-full bg-transparent">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {[0, 1].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentPage === page ? "bg-[#654625]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={nextPage} className="rounded-full bg-transparent">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
