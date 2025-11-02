"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Image from "next/image"

interface EnquiryForm {
  name: string
  email: string
  country: string
  state: string
  message: string
}

export default function EnquiryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [enquiryForm, setEnquiryForm] = useState<EnquiryForm>({
    name: "",
    email: "",
    country: "",
    state: "",
    message: "",
  })

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleInputChange = (field: keyof EnquiryForm, value: string) => {
    setEnquiryForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enquiryForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit enquiry")
      }

      setMessage({ type: "success", text: "Thank you for your enquiry! We'll get back to you soon." })

      // Reset form
      setEnquiryForm({
        name: "",
        email: "",
        country: "",
        state: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting enquiry:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full grid place-items-center px-8 md:px-[16rem] lg:px-[21rem] py-12">

        {/* Back Button */}
        <div className="w-full" >
          <Link href="/" className="w-fit inline-flex text-left gap-2 text-[#654625] hover:text-[#4a3319] mb-6">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="absolute mx-auto z-20 top-20">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 w-fit ${
               message.type === "error"
               ? "bg-red-500/85 backdrop-blur-sm text-red-50 border border-red-200"
               : "bg-green-500 text-green-50 border border-green-200"
                }`}
              >
                    {message.type === "error" && <AlertCircle size={20} />}
              <span className="whitespace-nowrap text-sm" >{message.text}</span>
            </div>
          )}
        </div>


        <div className="w-full grid place-items-start gap-8">
          <h1 className="headline-text leading-normal lg:leading-normal md:leading-normal w-full lg:w-1/2 text-3xl md:text-4xl lg:text-5xl font-bold">
            What Do You Have In Mind?
          </h1>
        </div>

        <section className="w-full mt-10 ">
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
            <div>
              <Label className="w-full" htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={enquiryForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
              />
            </div>

            <div>
              <Label className="w-full" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={enquiryForm.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
              />
            </div>

            <div>
              <Label className="w-full" htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                value={enquiryForm.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                required
                className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
              />
            </div>

            <div>
              <Label className="w-full" htmlFor="state">State/Region</Label>
              <Input
                id="state"
                type="text"
                value={enquiryForm.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
                className="bg-gray-200 h-14 border-none rounded-xl mt-1 w-full"
              />
            </div>

            <div className="lg:col-span-2">
              <Label className="w-full" htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={enquiryForm.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                required
                placeholder="Tell us how we can help you..."
                className="bg-gray-200 border-none rounded-xl mt-1 min-h-[120px] w-full"
                rows={4}
              />
            </div>

            <div className="lg:col-span-2 mt-4 w-full">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 h-14 bg-[#F7BA4C] font-medium rounded-xl"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </Button>
            </div>
          </form>
        </section>
    </main>
  )
}