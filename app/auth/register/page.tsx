"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Menu } from "lucide-react"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Store registration data for login page to use
        localStorage.setItem('pendingRegistration', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        }))
        // Redirect to login with success message
        router.push('/auth/login?message=Account created successfully! Please log in with your email.')
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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

      {/* Make an enquiry button - desktop */}
      <Link
        href="/enquiry"
        className="hidden md:block absolute top-6 right-6 z-50 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 text-white text-sm font-medium"
      >
        Make An Enquiry
      </Link>

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
          <Image
            src="/aulonaflows-logo-dark.svg"
            alt="AulonaFlows"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join AulonaFlows and start your wellness journey</p>
        </div>

        <div className="grid place-items-center h-screen w-full relative z-50" >


        <Card className="bg-transparent/50 backdrop-blur-sm border border-white/15 py-8 px-7 rounded-2xl h-auto w-[90%] md:w-[30%]" >
          <CardHeader>
            <Image
            src="/aulonaflows-logo-white.svg"
            alt="AulonaFlows"
            width={50}
            height={50}
            className="mx-auto mb-2"
          />
            <CardTitle className="text-white text-center text-2xl font-medium" >Create Your Account</CardTitle>
            <p className="text-white/70 text-sm text-center" >Sign Up to get easy access to all your bookings and exclusive AlounaFlows deals.</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-white mb-1" ></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="mt-1 bg-transparent h-14 border border-white/30 text-white rounded-xl placeholder-white/70 text-sm"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-white mb-1" ></Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="mt-1 bg-transparent h-14 border border-white/30 text-white rounded-xl placeholder-white/70 text-sm"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <Label htmlFor="email"></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 bg-transparent h-14 border border-white/30 text-white rounded-xl placeholder-white/70 text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E3C9A3] hover:bg-[#a48a6c] text-white h-14 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Already have an account?{" "}
                <Link
                  href={returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/auth/login"}
                  className="text-[#E3C9A3] hover:bg-[#a48a6c] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
    </section>
  )
}