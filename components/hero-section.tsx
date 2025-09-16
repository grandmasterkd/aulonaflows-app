import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-end"
      style={{
        backgroundImage: "url('/serene-yoga-studio-with-natural-lighting-and-plant.jpg')",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content positioned in bottom left */}
      <div className="relative z-10 p-8 md:p-16 max-w-2xl">
        {/* Logo placeholder */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center">
            <span className="headline-text text-2xl font-bold">AF</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="headline-text text-4xl md:text-6xl font-bold mb-4 text-white">Begin Your Journey Inward</h1>

        {/* Subtext */}
        <p className="paragraph-text text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
          Discover inner peace and strength through mindful movement, healing sounds, and transformative wellness
          practices in the heart of Glasgow.
        </p>

        {/* CTA Button */}
        <Link href="/book">
          <Button className="brand-bg-brown brand-text-cream rounded-3xl px-8 py-6 text-lg font-medium hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2">
            Book A Class
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
