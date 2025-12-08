"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { authService } = await import("@/lib/services/auth-service")
      const result = await authService.signInWithPassword(email, password)

      if (result.success && result.user) {
        toast.success("Login successful!")
        router.push('/admin/dashboard')
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center py-0 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full overflow-hidden">
        <div className=" h-auto md:h-[500px] flex flex-col lg:flex-row gap-16">
          {/* Left Side - Image */}
          <div className="lg:w-1/2 relative h-[400px] lg:h-full">
            <Image src="/admin-login-bg.webp" alt="Meditation space" fill className="rounded-3xl object-cover" />

          </div>

          {/* Right Side - Form */}
          <div className="h-full flex flex-col items-start justify-between">
            <div className="max-w-xl h-full w-full space-y-8 overflow-auto">

              <div className="max-w-xs text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                  Login To Your Dashboard
                </h2>
              </div>

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
                         type="password"
                         autoComplete="current-password"
                         required
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="border-none bg-gray-200 rounded-xl h-14 transition-all duration-200 focus:ring-2 focus:ring-[#E3C9A3]"
                       />
                     </div>
                   </div>
                 </div>

                {error && <div className="text-red-600 text-sm text-center animate-fade-in">{error}</div>}

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl bg-[#E3C9A3] hover:bg-[#D4B896] text-black font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
