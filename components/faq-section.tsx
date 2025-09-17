"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { faqsData } from "@/utils/faqs-data"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <main ref={sectionRef} className="py-12 md:py-24 px-8 md:px-24 lg:px-44 bg-white">
      <section className="container mx-auto bg-[#57463B] w-full h-full md:h-[540px] rounded-[1.5rem] md:rounded-[2rem] grid grid-cols-1 md:grid-cols-2 p-6 md:p-11 overflow-auto">   
           <div
          className={`col-span-1 text-center mb-6 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="md:mx-0 mx-auto headline-text p-0 md:p-4 max-w-sm text-center md:text-left text-[#E3C9A3] leading-normal lg:leading-normal text-xl lg:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="col-span-1 space-y-2 overflow-y-auto" >
          {faqsData.map((faq, index) => (
            <div
              key={index}
              className={` bg-[#C6A789]/70 rounded-xl  md:rounded-2xl overflow-hidden transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-3 md:p-5 flex gap-2 items-center justify-between hover:bg-[#C6A789]/20 transition-all duration-300 ease-out"
              >
                <span className="text-[#FFE7BB] text-base md:text-lg font-medium pr-4">{faq.question}</span>
                <div
                  className={`transition-transform duration-300 ease-out ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
                </div>
              </button>

              <div
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-3 md:px-5 pb-4">
                  <p className="text-white text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </section>
    
    </main>
  )
}
