import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FAQSection } from "@/components/faq-section"
import { FooterSection } from "@/components/footer-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home · Aulona Flows",
  description: "Begin your journey inward with Aulona Flows. Offering yoga classes, sound therapy, wellness events, and corporate bookings.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div id="clients">
        <ReviewsSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      <FooterSection />
    </main>
  )
}
