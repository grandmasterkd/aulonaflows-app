import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function FooterSection() {
  return (
    <section className="min-h-screen grid place-items-center px-8 md:px-16 brand-bg-cream">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-0 items-center">
          {/* Left Column */}
          <div className="h-full flex flex-col items-start justify-between gap-y-8">
            {/* Headline */}
            <h2 className="headline-text leading-normal text-5xl font-semibold">Begin Your <br/> Journey Inward <br/> Today</h2>

            {/* Description */}
            <div className="space-y-3" >

          
            <p className="w-full md:max-w-md paragraph-text text-base leading-relaxed">
              Not just classes, experiences that meet 
              you where you are and guide you home. 
            </p>

            {/* CTA Button and Customer Images */}
            <div className="flex items-center gap-6">
              <Link href="/book">
                <Button className="brand-bg-brown text-[#FFDDB9] rounded-full w-fit h-14 text-lg font-medium hover:bg-opacity-90 transition-all duration-300">
                  Book A Class
                  <div className="bg-[#C6A789] w-12 h-12 rounded-full p-2 flex items-center justify-center" >
                   <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                 
                </Button>
              </Link>

              {/* Customer Images */}
              <div className="flex -space-x-2">
                <Image
                  src="/review-potrait-6.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/review-potrait-1.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/review-potrait-3.jpg"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
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
    </section>
  )
}
