"use client"
import { ChevronRight, Instagram, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function FooterSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPoliciesModal, setShowPoliciesModal] = useState(false)
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

  useEffect(() => {
    if (showPoliciesModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showPoliciesModal])

  return (
    <>
      <section
        ref={sectionRef}
        className="min-h-screen grid place-items-center py-12 md:py-0 px-8 md:px-16 lg:px-24 xl:px-44 brand-bg-cream"
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
                  <div className="hidden -space-x-2 sm:-space-x-4">
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
                    src="/aulona-personal-4.webp"
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
                    src="/aulona-personal-2.webp"
                    alt="Meditation space"
                    width={200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <div
                  className={`p-5 flex flex-col items-start justify-end gap-1 h-32 sm:h-40 lg:h-[200px] headline-text  text-sm font-extrabold bg-[#E3C9A3] rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                  style={{ animationDelay: "1.2s" }}
                >
                  <span>movement.</span>
                  <span>wellness.</span>
                  <span>energy healing.</span>
                
                </div>
                <div
                  className={`h-48 sm:h-60 lg:h-[300px] bg-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-500 animate-fade-in-up`}
                  style={{ animationDelay: "1.4s" }}
                >
                  <Image
                    src="/aulona-personal-5.webp"
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
                    src="/aulona-personal-6.webp"
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
                    src="/aulona-personal-9.webp"
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
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Link
                  href="https://www.instagram.com/aulonaflows/"
                  target="_blank"
                  className="hover:text-[#7A5A3D] transition-colors duration-300 group"
                >
                  <span className="text-[#9A7153] block text-sm lg:text-base">Connect With Me</span>
                  <Instagram className="text-black block size-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>

                <Link href="mailto:contact@aulonaflows.com" className="text-sm lg:text-base">
                  <span className="block text-[#9A7153]">Email</span> contact@aulonaflows.com
                </Link>
              </div>
              <div>
                <button
                  onClick={() => setShowPoliciesModal(true)}
                  className="flex items-center gap-1 opacity-30 hover:opacity-60 transition-opacity duration-300 cursor-pointer text-sm lg:text-base"
                >
                  View Policies <ChevronRight className="size-4" />
                </button>
                <div className="text-sm lg:text-base">All Rights Reserved. Copyright 2025</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPoliciesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/10 backdrop-blur-sm border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="p-2 text-3xl headline-text font-semibold">Policies</h2>
              <button
                onClick={() => setShowPoliciesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-lg headline-text font-semibold mb-2">Cancellations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0">•</span>
                    <span>
                      <strong>Classes:</strong> Minimum 24 hours' notice required for cancellations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>
                      <strong>Sound baths & special events:</strong> Minimum 48 hours' notice required.
                    </span>
                  </li>
                </ul>
                <p className="mt-3 text-gray-700">
                  Due to limited spaces, refunds cannot be given for late or same-day cancellations.
                </p>
              </div>

              <div>
                <h3 className="text-lg headline-text font-semibold mb-2">Late Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Please aim to arrive at least 10 minutes before class begins. Doors close at the start time to avoid
                  disruption once the session has started. In rare cases of an emergency, I may keep the door open for a
                  few extra minutes, but overall I kindly ask that you show up on time so you can settle in peacefully
                  and get the most from your practice.
                </p>
              </div>

              <div>
                <h3 className="text-lg headline-text font-semibold mb-2">Health & Safety</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>
                      All participants are required to complete a health form before attending their first session.
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>
                      If you have any health concerns, please disclose them on the form so I can advise whether the
                      class is suitable.
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Classes and sound baths are not recommended during pregnancy at this time.</p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg headline-text font-semibold mb-2">Respect & Etiquette</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Please switch phones to silent before class.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Respect the quiet space — many people use this time to unwind and ground themselves.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Be mindful of others' mats and personal space.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Listen to your body and move at your own pace without judgment.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <p>Support the collective energy by showing kindness and respect to everyone in the room.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
