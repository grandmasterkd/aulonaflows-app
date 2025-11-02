"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { reviewsData } from "@/utils/reviews-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type React from "react"

interface Review {
  id: number
  name: string
  session: string
  location: string
  review: string
  image: string
}

function ReviewCard({
  review,
  className,
  isVisible,
  delay = 0,
}: {
  review: Review
  className?: string
  isVisible: boolean
  delay?: number
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className={`brand-bg-beige rounded-3xl p-6 flex flex-col justify-between h-full overflow-hidden transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <Image
            src={review.image || "/placeholder.svg"}
            alt={review.name}
            width={48}
            height={48}
            className="hidden w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <h3 className="headline-text text-lg font-semibold line-clamp-1">{review.name}</h3>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-black text-sm leading-relaxed line-clamp-3">{review.review}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-white/50 backdrop-blur-sm w-auto px-6 rounded-3xl h-8 text-[#57463B] hover:underline text-xs"
          >
            Read More
          </Button>
        </div>

        <div className="mt-5 md:mt-0  flex-shrink-0">
         
          <p className="text-base font-medium paragraph-text text-[#FFF0D8] line-clamp-1">{review.location}</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[80%] h-auto md:max-w-2xl md:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-0">
              <Image
                src={review.image || "/placeholder.svg"}
                alt={review.name}
                width={60}
                height={60}
                className="hidden w-14 h-14 rounded-full object-cover"
              />
              <div className="flex flex-col items-start" >
                <DialogTitle className="headline-text text-xl font-semibold">{review.name}</DialogTitle>
                <span className="text-sm text-gray-600 flex items-center gap-x-1">
                 <p>{review.location}</p>
                </span>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-0">
            <p className="text-gray-500 text-sm leading-relaxed">{review.review}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ReviewsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Group reviews into chunks of 7
  const reviewsPerPage = 7
  const totalPages = Math.ceil(reviewsData.length / reviewsPerPage)
  const paginatedReviews = Array.from({ length: totalPages }, (_, pageIndex) =>
    reviewsData.slice(pageIndex * reviewsPerPage, (pageIndex + 1) * reviewsPerPage)
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("reviews-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const nextPage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
      setIsTransitioning(false)
    }, 300)
  }

  const prevPage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
      setIsTransitioning(false)
    }, 300)
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
    const isLeftSwipe = distance > 30
    const isRightSwipe = distance < -30

    if (isLeftSwipe) {
      nextPage()
    } else if (isRightSwipe) {
      prevPage()
    }

    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const currentReviews = paginatedReviews[currentPage] || []

  return (
    <section
      id="reviews-section"
      className="py-20 px-8 md:px-24 lg:px-44 brand-bg-cream"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`headline-text text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } ${isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"}`}
            style={{ transitionDelay: "100ms" }}
          >
            What Our Clients Love
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[600px] transition-all duration-500 ease-out transform ${
            isDragging ? "scale-95" : "scale-100"
          } ${isTransitioning ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"}`}
        >
          {/* Render reviews for current page */}
          {currentReviews.map((review, index) => {
            const delays = [200, 300, 400, 500, 600, 700, 800]
            const layouts = [
              "lg:row-span-1",
              "sm:col-span-1 lg:col-span-2 lg:row-span-1",
              "lg:row-span-1",
              "lg:row-span-1",
              "lg:row-span-1",
              "lg:row-span-1",
              "lg:row-span-1"
            ]

            return (
              <ReviewCard
                key={`${currentPage}-${review.id}`}
                review={review}
                className={layouts[index] || "lg:row-span-1"}
                isVisible={isVisible && !isTransitioning}
                delay={delays[index] || 200}
              />
            )
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 md:mt-16">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                    currentPage === index ? "bg-[#654625] scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
