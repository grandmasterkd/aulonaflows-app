"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "forgot">("login")
  const router = useRouter()

  const starters: Array<"login" | "forgot"> = ["login", "forgot"]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("[v0] Login error:", error)
        throw error
      }

      console.log("[v0] Login successful, user:", data.user?.email)

      await new Promise((resolve) => setTimeout(resolve, 100))

      window.location.href = "/admin/dashboard"
    } catch (error: unknown) {
      console.log("[v0] Login failed:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) throw error

      alert("Password reset email sent! Check your inbox.")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full overflow-hidden">
        <div className=" h-auto md:h-[500px] flex flex-col lg:flex-row gap-16">
          {/* Left Side - Image */}
          <div className="lg:w-1/2 relative h-[400px] lg:h-full">
            <Image src="/admin-login-bg.jpg" alt="Meditation space" fill className="rounded-3xl object-cover" />
            
          </div>

          {/* Right Side - Form */}
          <div className="h-full flex flex-col items-start justify-between">
            <div className="max-w-xl h-full w-full space-y-8 overflow-auto">
              

              {/* Animated tab buttons */}
            <div className="flex justify-start">
            <div className="w-fit overflow-x-auto relative bg-gray-200 rounded-full p-1.5 flex">
              {starters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveTab(filter)}
                  className={`px-6 py-3 rounded-full text-xs md:text-sm whitespace-nowrap font-medium transition-all ${
                    activeTab === filter ? "bg-black text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter === "login" ? "Login" : "Forgot Password"}
                </button>
              ))}
            </div>
            </div>

              <div className="max-w-xs text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                  {activeTab === "login" ? "Login To Your Dashboard" : "Enter Email To Reset Your Password"}
                </h2>
              </div>

              {/* Smooth content transitions */}
              <div className="relative overflow-hidden">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    activeTab === "login"
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform -translate-x-full absolute inset-0"
                  }`}
                >
                  <form className="mt-2 md:mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative mt-1">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pr-10 border-none bg-gray-200 rounded-xl h-14 transition-all duration-200 focus:ring-2 focus:ring-[#E3C9A3]"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10 border-none bg-gray-200 rounded-xl h-14 transition-all duration-200 focus:ring-2 focus:ring-[#E3C9A3]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="text-right mt-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab("forgot")}
                            className="text-xs underline text-[#654625] hover:text-[#57463B] transition-all duration-200"
                          >
                            Forgot your password?
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center animate-fade-in">{error}</div>}

                    <div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-xl bg-[#E3C9A3] hover:bg-[#D4B896] text-black font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </div>
                  </form>
                </div>

                <div
                  className={`transition-all duration-500 ease-in-out ${
                    activeTab === "forgot"
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform translate-x-full absolute inset-0"
                  }`}
                >
                  <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="forgot-email">Email address</Label>
                        <div className="relative mt-1">
                          <Input
                            id="forgot-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pr-10 h-14 border-none bg-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#E3C9A3]"
                            placeholder="Enter your email to reset password"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200" />
                        </div>
                      </div>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center animate-fade-in">{error}</div>}

                    <div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-xl bg-[#E3C9A3] hover:bg-[#D4B896] text-black font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      >
                        {isLoading ? "Sending..." : "Send Reset Email"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
