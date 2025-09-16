import { Button } from "@/components/ui/button"
import { ChevronRight, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function FooterSection() {
  return (
    <section className="min-h-screen grid place-items-center px-8 md:px-24 lg:px-44 brand-bg-cream">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-0 items-center">
          {/* Left Column */}
          <div className="h-full flex flex-col items-start justify-between gap-y-8">
            {/* Headline */}
            <h2 className="headline-text leading-normal text-4xl font-semibold">Begin Your <br/> Journey Inward <br/> Today</h2>

            {/* Description */}
            <div className="space-y-3" >

          
            <p className="w-full md:max-w-md text-base leading-relaxed">
              Not just classes, experiences that meet 
              you where you are and guide you home. 
            </p>

            {/* CTA Button and Customer Images */}
            <div className="flex items-center gap-6">
              <Link href="/book">
                <div className="brand-bg-brown text-[#FFDDB9] rounded-full w-auto h-14 pl-6 px-2 text-lg flex items-center justify-between gap-3 font-medium hover:bg-opacity-90 transition-all duration-300">
                  Book A Class
                  <div className="bg-[#C6A789] w-11 h-11 rounded-full flex items-center justify-center" >
                   <ChevronRight className="size-6  text-white" />
                  </div>
                 
                </div>
              </Link>

              {/* Customer Images */}
              <div className="flex -space-x-4">
                <Image
                  src="/review-potrait-2.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/review-potrait-4.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/review-potrait-5.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
              </div>
            </div>
              </div>
          </div>

          {/* Right Column - Image Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="h-[300px] bg-gray-200 rounded-3xl overflow-hidden">
                <Image
                  src="/footer-test-1.jpg"
                  alt="Yoga in nature"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[200px] bg-[#FEDED4] rounded-3xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Meditation space"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-[200px] bg-[#E3C9A3] rounded-3xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Sound healing"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] bg-gray-200 rounded-3xl overflow-hidden">
                <Image
                  src="/footer-test-3.jpg"
                  alt="Studio space"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-[300px] bg-gray-200 rounded-3xl overflow-hidden">
                <Image
                  src="/footer-test-2.jpg"
                  alt="Yoga community"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[200px] bg-[#FFBA86] rounded-3xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Peaceful practice"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div className="border-t border-black/20 w-full h-0.5 " > 
      <div className="flex items-center justify-between" >
        <div className="flex items-center gap-x-4">

        
      <Link href="https://www.instagram.com/aulonaflows/" target="_blank" className="flex items-center gap-x-1" >  Follow Us <Instagram /></Link> 
      <div>Contact +44 0000 0000</div> 
      <div>Email hi@aulonaflows.com</div> 
      </div>
      <span> All Rights Reserved. Copyright 2025</span>
      </div>
      
     
        </div>
    </section>
  )
}
