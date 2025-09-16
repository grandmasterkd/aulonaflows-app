"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "Do I need any prior experience to join your yoga classes?",
    answer:
      "Not at all! Our classes welcome practitioners of all levels, from complete beginners to advanced yogis. I provide modifications and variations for every pose, ensuring everyone can participate safely and comfortably. Your willingness to explore and be present is all you need to bring.",
  },
  {
    question: "What should I bring to my first class?",
    answer:
      "Just bring yourself and wear comfortable clothing that allows you to move freely. We provide all necessary equipment including mats, blocks, bolsters, and blankets. If you have your own mat and prefer to use it, you're welcome to bring it along.",
  },
  {
    question: "How do sound therapy sessions work?",
    answer:
      "During sound therapy sessions, you'll lie comfortably while I play various healing instruments including crystal singing bowls, gongs, and chimes. The vibrations help calm the nervous system, reduce stress, and promote deep relaxation. No experience is needed - simply allow yourself to receive the healing sounds.",
  },
  {
    question: "Can you accommodate corporate bookings and private sessions?",
    answer:
      "I offer customized sessions for businesses, private groups, and individuals. Corporate sessions can be tailored to fit your workplace schedule and space, while private sessions allow for personalized attention to your specific needs and goals. Contact me to discuss your requirements.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-8 md:px-16 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="headline-text leading-normal text-4xl font-semibold">Frequently Asked Questions</h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className=" overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="paragraph-text text-lg font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#C6A789] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#C6A789] flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-black leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
