"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function HeroSection() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <section className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-end">
      <Image
        src="/aulonaflows-mobilehero.webp"
        alt="AulonaFlows Hero Background"
        layout="fill"
        objectFit="cover"
        className="md:hidden mix-blend-luminosity"
      />
      <Image
        src="/aulonaflows-desktophero.webp"
        alt="AulonaFlows Hero Background"
        layout="fill"
        objectFit="cover"
        className="hidden md:block mix-blend-luminosity"
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-6 right-6 z-50 bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      <div
        className={`md:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-40 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8 p-8">
          <button
            onClick={() => scrollToSection("about")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            About Aulona
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Aulona's Services
          </button>
          <button
            onClick={() => scrollToSection("clients")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Aulona's Clients
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Frequently Asked Questions
          </button>
          <Link
            href="/book"
            className="bg-white backdrop-blur-sm w-fit h-auto p-4 px-6 rounded-full text-lg font-medium hover:text-[#FFDDB9] transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book A Class
          </Link>
        </nav>
      </div>

      {/* Content positioned in bottom left */}
      <div className="relative z-10 p-6 pb-12 md:pb-24 md:p-24">
        {/* Logo placeholder */}
        <div className="mb-6">
          <Image src="aulonaflows-logo-white.svg" alt="AulonaFlows Logo" width={70} height={70} />
        </div>

        {/* Headline */}
        <h1 className="headline-text leading-normal md:leading-normal text-3xl md:text-5xl font-semibold mb-3 text-white">
          The Healing You
          <br />
          Seek Lives Within You
        </h1>

        {/* Subtext */}
        <p className="w-auto lg:max-w-xl text-sm md:text-lg mb-6 text-white/90 leading-relaxed">
          Discover inner peace and strength through mindful movement, healing sounds, and transformative wellness
          practices in the heart of Glasgow.
        </p>

        {/* CTA Button */}
        <Link href="/book" className="flex items-center gap-x-1.5">
          <div className="w-fit rounded-full p-1 md:p-1.5 h-auto bg-transparent border-2 border-[#FDC7AA] ">
            <Button
              className="border border-[#FFBE5D] rounded-3xl px-4 md:px-8 py-3 md:py-6 text-xs md:text-base font-medium transition-all duration-300 flex items-center gap-2"
              style={{
                background: "linear-gradient(90deg, #FFE3E1 0%, #FFD3B3 53%, #FFDDB9 100%)",
                color: "#654625",
              }}
            >
              BOOK A CLASS
            </Button>
          </div>
          <div className="bg-[#FFDDB9] h-10 md:h-14 w-10 md:w-14 p-2 rounded-xl md:rounded-2xl flex items-center justify-center">
            <ChevronRight className="text-[#A56024] size-7" />
          </div>
        </Link>
      </div>
    </section>
  )
}
