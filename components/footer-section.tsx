import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function FooterSection() {
  return (
    <section className="py-20 px-8 md:px-16 brand-bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Headline */}
            <h2 className="headline-text text-4xl md:text-5xl font-bold">Begin Your Journey Inward</h2>

            {/* Description */}
            <p className="paragraph-text text-lg leading-relaxed">
              Take the first step towards transformation. Join our welcoming community and discover the profound
              benefits of mindful movement, healing sounds, and inner exploration. Your journey to wellness starts here.
            </p>

            {/* CTA Button and Customer Images */}
            <div className="flex items-center gap-6">
              <Link href="/book">
                <Button className="brand-bg-brown brand-text-cream rounded-3xl px-8 py-4 text-lg font-medium hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2">
                  Book A Class
                  <ChevronRight className="w-5 h-5 text-white" />
                </Button>
              </Link>

              {/* Customer Images */}
              <div className="flex -space-x-2">
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Image Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Yoga in nature"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
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
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Sound healing"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Studio space"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Yoga community"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
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
