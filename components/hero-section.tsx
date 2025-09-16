import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-end"
      style={{
        backgroundImage: "url('/home-herobg.jpg')",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content positioned in bottom left */}
      <div className="relative z-10 p-8 md:p-20">
        {/* Logo placeholder */}
        <div className="mb-6">
         
            <Image src="aulonaflows-logo-white.svg" alt="AulonaFlows Logo" width={100} height={100} />
     
        </div>

        {/* Headline */}
        <h1 className="headline-text leading-normal md:leading-normal text-4xl md:text-6xl font-semibold mb-3 text-white">The healing you 
         <br/>seek lives within you</h1>

        {/* Subtext */}
        <p className="w-full md:max-w-3xl paragraph-text text-lg md:text-xl mb-6 text-white/90 leading-relaxed">
          Discover inner peace and strength through mindful movement, healing sounds, and transformative wellness
          practices in the heart of Glasgow.
        </p>

        {/* CTA Button */}
        <Link href="/book" className="flex items-center gap-x-1.5" >
        <div className="w-fit rounded-full p-1.5 h-auto bg-transparent border-2 border-[#FDC7AA] " >
        <Button className="border border-[#FFBE5D] rounded-3xl px-8 py-6 text-base font-medium transition-all duration-300 flex items-center gap-2"
          style={{
            background: "linear-gradient(90deg, #FFE3E1 0%, #FFD3B3 53%, #FFDDB9 100%)",
            color: "#654625", // A dark brown that should contrast well with the gradient
          }}
        
        >
          BOOK A CLASS
        
        </Button>
        </div>
        <div className="bg-[#FFDDB9] h-14 w-14 p-2 rounded-2xl flex items-center justify-center" >
         <ChevronRight className="text-[#A56024] size-7" />
        </div>
  
        </Link>
      </div>
    </section>
  )
}
