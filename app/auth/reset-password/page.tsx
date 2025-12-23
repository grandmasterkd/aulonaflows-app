"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, X, Menu } from "lucide-react"
import Image from "next/image"
import { authService } from "@/lib/services/auth-service"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated (from reset link)
    const checkAuth = async () => {
      const session = await authService.getSession()
      if (!session) {
        setError("Invalid or expired reset link")
      }
    }
    checkAuth()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.updatePassword(newPassword)
      if (result.success) {
        setSuccess(true)
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(result.error || "Failed to update password")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-end">
      <Image
        src="/aulonaflows-mobilehero.webp"
        alt="AulonaFlows Hero Background"
        fill
        objectFit="cover"
        className="md:hidden mix-blend-luminosity"
      />
      <Image
        src="/aulonaflows-desktophero.webp"
        alt="AulonaFlows Hero Background"
        fill
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
        <nav className="flex flex-col items-center justify-center h-full gap-8 p-8">
          <button
            onClick={() => scrollToSection("about")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            About Aulona
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Aulona's Services
          </button>
          <button
            onClick={() => scrollToSection("clients")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Aulona's Clients
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
          >
            Frequently Asked Questions
          </button>
          <Link
            href="/book"
            className="bg-white backdrop-blur-sm w-fit h-auto p-4 px-6 rounded-full text-lg font-medium hover:text-[#FFDDB9] transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book A Class
          </Link>
          <Link
            href="/enquiry"
            className="text-white text-xl font-medium hover:text-[#FFDDB9] transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Make an enquiry
          </Link>
        </nav>
      </div>

      <div className="grid place-items-center h-screen w-full relative z-50">
        <Card className="bg-transparent/50 backdrop-blur-sm border border-white/15 py-8 md:px-3 px-1 rounded-2xl h-auto w-[90%] md:w-[30%]" >
          <CardHeader>
            <Image
              src="/aulonaflows-logo-white.svg"
              alt="AulonaFlows"
              width={50}
              height={50}
              className="mx-auto mb-2"
            />
            <CardTitle className="text-white text-center text-2xl font-medium" >Reset Password</CardTitle>
            <p className="text-white/70 text-sm text-center" >Enter your new password below.</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-green-800">Password updated successfully! Redirecting to login...</p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-white mb-1" ></Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="mt-1 bg-transparent h-14 border border-white/30 text-white rounded-xl placeholder-white/70 text-sm"
                      placeholder="New password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white mb-1" ></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 bg-transparent h-14 border border-white/30 text-white rounded-xl placeholder-white/70 text-sm"
                    placeholder="Confirm new password"
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#E3C9A3] hover:bg-[#a48a6c] text-white h-14 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
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