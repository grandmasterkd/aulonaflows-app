"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { faqsData } from "@/utils/faqs-data"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const totalPages = Math.ceil(faqsData.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFAQs = faqsData.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      setOpenIndex(null) // Close any open FAQ when changing pages
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setOpenIndex(null) // Close any open FAQ when changing pages
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentPage < totalPages - 1) {
      goToNextPage()
    }
    if (isRightSwipe && currentPage > 0) {
      goToPrevPage()
    }
  }

  return (
    <main ref={sectionRef} className="py-12 md:py-24 px-8 md:px-24 lg:px-44 bg-white">
      <section
        className="container mx-auto bg-[#57463B] w-full h-full md:h-[540px] rounded-[1.5rem] md:rounded-[2rem] grid grid-cols-1 md:grid-cols-2 p-6 md:p-11 overflow-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`col-span-1 text-center mb-6 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="md:mx-0 mx-auto headline-text p-0 md:p-4 max-w-sm text-center md:text-left text-[#E3C9A3] leading-normal lg:leading-normal text-xl lg:text-4xl font-bold">
            Frequently Asked Questions
          </h2>

          {totalPages > 1 && (
            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full transition-all duration-300 ${
                  currentPage === 0 ? "text-[#E3C9A3]/30 cursor-not-allowed" : "text-[#E3C9A3] hover:bg-[#E3C9A3]/10"
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <span className="text-[#E3C9A3] text-sm font-medium">
                {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className={`p-2 rounded-full transition-all duration-300 ${
                  currentPage === totalPages - 1
                    ? "text-[#E3C9A3]/30 cursor-not-allowed"
                    : "text-[#E3C9A3] hover:bg-[#E3C9A3]/10"
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-2 overflow-y-auto">
          {currentFAQs.map((faq, index) => (
            <div
              key={startIndex + index}
              className={`bg-[#C6A789]/70 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <button
                onClick={() => toggleFAQ(startIndex + index)}
                className="w-full text-left p-3 md:p-5 flex gap-2 items-center justify-between hover:bg-[#C6A789]/20 transition-all duration-300 ease-out"
              >
                <span className="text-[#FFE7BB] text-base md:text-lg font-medium pr-4">{faq.question}</span>
                <div
                  className={`transition-transform duration-300 ease-out ${
                    openIndex === startIndex + index ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
                </div>
              </button>

              <div
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  openIndex === startIndex + index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-3 md:px-5 pb-4">
                  <p className="text-white text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
