"use client"
import { ChevronRight, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function FooterSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  return (
    <section
      ref={sectionRef}
      className="min-h-screen grid place-items-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-44 brand-bg-cream"
    >
      <div className="container mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
          {/* Left Column */}
          <div
            className={`h-full flex flex-col items-start justify-between gap-y-6 lg:gap-y-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="headline-text leading-normal md:leading-normal lg:leading-normal text-3xl md:text-4xl lg:text-5xl font-semibold animate-fade-in-up">
              Begin Your <br /> Journey Inward <br /> Today
            </h2>

            <div className="space-y-4 lg:space-y-6">
              <p
                className={`w-full max-w-md text-sm sm:text-base lg:text-lg leading-relaxed transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Not just classes, experiences that meet you where you are and guide you home.
              </p>

              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-all duration-1000 delay-400 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <Link href="/book" className="group">
                  <div className="brand-bg-brown text-[#FFDDB9] rounded-full w-auto h-12 sm:h-14 pl-4 sm:pl-6 px-2 text-base sm:text-lg flex items-center justify-between gap-2 sm:gap-3 font-medium hover:bg-opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Book A Class
                    <div className="bg-[#C6A789] w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                      <ChevronRight className="size-4 sm:size-6 text-white" />
                    </div>
                  </div>
                </Link>

                {/* Customer Images */}
                <div className="flex -space-x-2 sm:-space-x-4">
                  {["/review-potrait-2.jpg", "/review-potrait-4.jpg", "/review-potrait-5.jpg"].map((src, index) => (
                    <Image
                      key={index}
                      src={src || "/placeholder.svg"}
                      alt="Customer"
                      width={50}
                      height={50}
                      className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-white object-cover hover:scale-110 transition-transform duration-300 animate-float`}
                      style={{ animationDelay: `${index * 0.5}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 transition-all duration-1000 delay-600 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="space-y-2 sm:space-y-4">
              <div
                className={`h-48 sm:h-60 lg:h-[300px] bg-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "0.8s" }}
              >
                <Image
                  src="/footer-test-1.jpg"
                  alt="Yoga in nature"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`h-32 sm:h-40 lg:h-[200px] bg-[#FEDED4] rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "1.0s" }}
              >
                <Image
                  src="/radialeclipse.svg"
                  alt="Meditation space"
                  width={100}
                  height={100}
                  className="w-full h-full object-none object-right-top opacity-70"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-4">
              <div
                className={`h-32 sm:h-40 lg:h-[200px] bg-[#E3C9A3] rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "1.2s" }}
              >
                {/* <Image
                  src="/radialeclipse.svg"
                  alt="Sound healing"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                /> */}
              </div>
              <div
                className={`h-48 sm:h-60 lg:h-[300px] bg-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "1.4s" }}
              >
                <Image
                  src="/footer-test-3.jpg"
                  alt="Studio space"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-4 hidden sm:block">
              <div
                className={`h-48 sm:h-60 lg:h-[300px] bg-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "1.6s" }}
              >
                <Image
                  src="/footer-test-2.jpg"
                  alt="Yoga community"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`h-32 sm:h-40 lg:h-[200px] bg-[#FFBA86] rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                style={{ animationDelay: "1.8s" }}
              >
                <Image
                  src="/footer-test-4.jpg"
                  alt="Peaceful practice"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`border-t border-black/20 pt-6 lg:pt-8 transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Link
                href="https://www.instagram.com/aulonaflows/"
                target="_blank"
                className="flex items-center gap-x-2 text-[#9A7153] hover:text-[#7A5A3D] transition-colors duration-300 group"
              >
                <span>Follow Us</span>
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
               
              </Link>
              <div className="text-sm lg:text-base">
                <span className="text-[#9A7153]">Contact</span> +079 4668 4664
              </div>
              <Link href="mailto:dumaniaulona@hotmail.com" className="text-sm lg:text-base">
                <span className="text-[#9A7153]">Email</span> dumaniaulona@hotmail.com
              </Link>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">All Rights Reserved. Copyright 2025</span>
          </div>
        </div>
      </div>
    </section>
  )
}
