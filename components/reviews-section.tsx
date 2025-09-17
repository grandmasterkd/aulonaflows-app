"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { reviewsData } from "@/utils/reviews-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <h3 className="headline-text text-lg font-semibold line-clamp-1">{review.name}</h3>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-black text-sm leading-relaxed line-clamp-3">{review.review}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-white/50 backdrop-blur-sm w-auto px-6 rounded-3xl px-3 h-8 text-[#57463B] hover:underline text-xs"
          >
            Read More
          </Button>
        </div>

        <div className="mt-5 md:mt-0 text-xs paragraph-text text-white flex-shrink-0">
          <p className="line-clamp-1">{review.session}</p>
          <p className="line-clamp-1">{review.location}</p>
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
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="flex flex-col items-start" >
                <DialogTitle className="headline-text text-xl font-semibold">{review.name}</DialogTitle>
                <span className="text-sm text-gray-600 flex items-center gap-x-1">
                 <p>{review.session}</p>  • <p>{review.location}</p>
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

  return (
    <section id="reviews-section" className="py-20 px-8 md:px-24 lg:px-44 brand-bg-cream">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`headline-text text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            What Our Clients Love
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[600px]">
          {/* Row 1 - Desktop layout */}
          <ReviewCard review={reviewsData[0]} className="lg:row-span-1" isVisible={isVisible} delay={200} />

          <ReviewCard
            review={reviewsData[1]}
            className="sm:col-span-1 lg:col-span-2 lg:row-span-1"
            isVisible={isVisible}
            delay={300}
          />

          <ReviewCard review={reviewsData[2]} className="lg:row-span-1" isVisible={isVisible} delay={400} />

          {/* Row 2 - Desktop layout */}
          <ReviewCard review={reviewsData[3]} className="lg:row-span-1" isVisible={isVisible} delay={500} />

          <ReviewCard review={reviewsData[4]} className="lg:row-span-1" isVisible={isVisible} delay={600} />

          <ReviewCard review={reviewsData[5]} className="lg:row-span-1" isVisible={isVisible} delay={700} />

          <ReviewCard review={reviewsData[6]} className="lg:row-span-1" isVisible={isVisible} delay={800} />
        </div>
      </div>
    </section>
  )
}
