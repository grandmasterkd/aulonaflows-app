"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Markdown from "./ui/markdown"

const aboutContent = [
  {
    title: "Hello! I'm Aulona",
    content: `
I’m a yoga teacher and sound therapist, but to me, it’s so much more than a title. 

This work lights me up. It’s what I love, what I believe in, and what I’m here to share.  

Helping people feel safe in their bodies and connected to themselves is my purpose, 
and it means everything to me. This is my calling.  

This isn’t about being perfect or having it all together.  
It’s about showing up, tuning in, and learning to trust your body and your journey, 
one breath at a time.  

**Come as you are.**
    `,
  },
  {
    title: "My Roots",
    content: `
I’m Kosovan Albanian, born and raised in Glasgow. 
My family left everything behind during the war in Kosovo, immigrating in search of safety and a better life.  

That choice gave me opportunities they never had, and it’s something I carry with quiet strength and deep awareness. 
It’s a big part of what fuels my purpose.  

As I continue to grow in this journey, I move forward for myself and for those who came before me. 
For the strength in my roots, and the future I’m here to create.  

Their journey gave me a beginning, the rest is mine to build.
    `,
  },
  {
    title: "My Why",
    content: `
For years, I’ve been on a journey of self-growth and healing. 
Through journaling, yoga, meditation, and learning more about myself, I began to evolve.  

These practices helped me feel more connected, calm, and clear within myself. 
And the more I leaned into them, the more I knew: **this is what I’m meant to share.**  

Now, my purpose is to guide and support others as they reconnect with themselves, in their own way, at their own pace.  

Because the healing you seek is already within you. And I’m here to help you find it.  

Even if you’re not seeking healing, these practices are good for the soul.  
**Everyone is welcome.**
    `,
  },
  {
    title: "What I Offer",
    content: `
I offer more than just movement or stillness, I offer **space.**  

- Space to breathe.  
- To feel.  
- To come home to yourself.  

Through yoga, sound therapy, and mindful practices, I guide you back to the present.  

Whether you join a cosy evening class, an energising morning flow, a deeply restful sound bath, 
or a full-day retreat, every experience is designed with intention.  

My offerings are rooted in softness, self-connection, and safety, welcoming you exactly as you are.  

You don’t need to be flexible, spiritual, or experienced.  
Just open. Curious.  
And willing to meet yourself where you are.
    `,
  },
]

export function AboutSection() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("about-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const nextPage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % 4)
      setIsTransitioning(false)
    }, 200)
  }

  const prevPage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentPage((prev) => (prev - 1 + 4) % 4)
      setIsTransitioning(false)
    }, 200)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (isTransitioning || !touchStart || !touchEnd) {
      setIsDragging(false)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextPage()
    } else if (isRightSwipe) {
      prevPage()
    }

    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content })
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
    document.body.style.overflow = "unset"
  }

  return (
    <section
      id="about-section"
      className="min-h-screen grid place-items-center px-8 py-16 md:py-0 md:px-24 lg:px-44 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto">
        {/* Page 1: Hello! I'm Aulona */}
        {currentPage === 0 && (
          <div
            className={`grid md:grid-cols-2 gap-12 items-center place-items-center transition-all duration-500 ease-out transform ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            } ${isDragging ? "scale-95" : "scale-100"} ${
              isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"
            }`}
          >
            {/* Left Column - Single Text Container */}
            <div className="mt-0 lg:mt-40 space-y-8">
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible && !isTransitioning ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-10 scale-95"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[0].title}</h2>
                <div className="md:hidden">
                  <div className="line-clamp-3">
                    <Markdown content={aboutContent[0].content} />
                  </div>
                  <button
                    onClick={() => openModal(aboutContent[0].title, aboutContent[0].content)}
                    className="flex items-center mt-2 text-sm text-[#654625] hover:text-[#4a3319] font-medium transition-colors"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="hidden md:block prose prose-base lg:prose-lg max-w-none leading-relaxed">
                  <Markdown content={aboutContent[0].content} />
                </div>
              </div>
            </div>

            {/* Right Column - Single Image */}
            <div className="relative md:pr-44 pr-0 mt-0 pt-0 md:pt-24 pb-8 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto w-full h-[450px] md:h-[500px]">
                <div
                  className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
                    isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src="/aulona-temp-3.webp"
                    alt="Aulona practicing yoga"
                    width={384}
                    height={500}
                    className="w-full h-full object-cover aspect-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: My Roots */}
        {currentPage === 1 && (
          <div
            className={`grid md:grid-cols-2 gap-12 items-center place-items-center transition-all duration-500 ease-out transform ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            } ${isDragging ? "scale-95" : "scale-100"} ${
              isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"
            }`}
          >
            {/* Left Column - Single Text Container */}
            <div className="mt-0 lg:mt-40 space-y-8">
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible && !isTransitioning ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-10 scale-95"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[1].title}</h2>
                <div className="md:hidden">
                  <div className="line-clamp-3">
                    <Markdown content={aboutContent[1].content} />
                  </div>
                  <button
                    onClick={() => openModal(aboutContent[1].title, aboutContent[1].content)}
                    className="flex items-center mt-2 text-sm text-[#654625] hover:text-[#4a3319] font-medium transition-colors"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="hidden md:block prose prose-base lg:prose-lg max-w-none leading-relaxed">
                  <Markdown content={aboutContent[1].content} />
                </div>
              </div>
            </div>

            {/* Right Column - Single Image */}
            <div className="relative md:pr-44 pr-0 mt-0 pt-0 md:pt-24 pb-8 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto w-full md:w-96 h-[450px] md:h-[500px]">
                <div
                  className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
                    isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src="/albania-flag.webp"
                    alt="Albania Flag"
                    width={384}
                    height={500}
                    className="w-full h-full object-cover aspect-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 3: My Why */}
        {currentPage === 2 && (
          <div
            className={`grid md:grid-cols-2 gap-12 items-center place-items-center transition-all duration-500 ease-out transform ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            } ${isDragging ? "scale-95" : "scale-100"} ${
              isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"
            }`}
          >
            {/* Left Column - Single Text Container */}
            <div className="mt-0 lg:mt-40 space-y-8">
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible && !isTransitioning ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-10 scale-95"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[2].title}</h2>
                <div className="md:hidden">
                  <div className="line-clamp-3">
                    <Markdown content={aboutContent[2].content} />
                  </div>
                  <button
                    onClick={() => openModal(aboutContent[2].title, aboutContent[2].content)}
                    className="flex items-center mt-2 text-sm text-[#654625] hover:text-[#4a3319] font-medium transition-colors"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="hidden md:block prose prose-base lg:prose-lg max-w-none leading-relaxed">
                  <Markdown content={aboutContent[2].content} />
                </div>
              </div>
            </div>

            {/* Right Column - Single Image */}
           <div className="relative md:pr-44 pr-0 mt-0 pt-0 md:pt-24 pb-8 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto w-full md:w-96 h-[450px] md:h-[500px]">
                <div
                  className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
                    isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src="/aulona-temp-6.webp"
                    alt="Aulona practicing yoga"
                    width={384}
                    height={500}
                    className="w-full h-full object-cover aspect-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 4: What I Offer */}
        {currentPage === 3 && (
          <div
            className={`grid md:grid-cols-2 gap-12 items-center place-items-center transition-all duration-500 ease-out transform ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            } ${isDragging ? "scale-95" : "scale-100"} ${
              isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"
            }`}
          >
            {/* Left Column - Single Text Container */}
            <div className="mt-0 lg:mt-40 space-y-8">
              <div
                className={`space-y-4 transition-all duration-700 delay-200 ${
                  isVisible && !isTransitioning ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-10 scale-95"
                }`}
              >
                <h2 className="headline-text text-2xl md:text-4xl font-semibold">{aboutContent[3].title}</h2>
                <div className="md:hidden">
                  <div className="line-clamp-3">
                    <Markdown content={aboutContent[3].content} />
                  </div>
                  <button
                    onClick={() => openModal(aboutContent[3].title, aboutContent[3].content)}
                    className="flex items-center mt-2 text-sm text-[#654625] hover:text-[#4a3319] font-medium transition-colors"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="hidden md:block prose prose-base lg:prose-lg max-w-none leading-relaxed">
                  <Markdown content={aboutContent[3].content} />
                </div>
              </div>
            </div>

            {/* Right Column - Single Image */}
           <div className="relative md:pr-44 pr-0 mt-0 pt-0 md:pt-24 pb-8 md:mt-20 md:pb-0 flex flex-col items-start justify-center">
              <div className="mx-auto w-full md:w-96 h-[450px] md:h-[500px]">
                <div
                  className={`w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${
                    isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src="/aulona-about-why.webp"
                    alt="Aulona practicing yoga"
                    width={384}
                    height={500}
                    className="w-full h-full object-cover aspect-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-0 md:mt-24 mb-4 lg:mb-16">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            className="hidden rounded-full bg-transparent hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {[0, 1, 2, 3].map((page) => (
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

      {/* Modal for full content on mobile */}
      {isModalOpen && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isModalOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-500 ease-out ${
              isModalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-5 flex items-center justify-between z-10">
              <h3 className="headline-text text-xl md:text-2xl font-semibold text-[#654625]">{modalContent.title}</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 pb-8 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="prose prose-sm md:prose-base max-w-none leading-relaxed space-y-4">
                <Markdown content={modalContent.content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
