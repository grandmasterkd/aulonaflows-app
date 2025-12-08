"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react"

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Clear any sensitive data from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('email')
      url.searchParams.delete('password')
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.pathname + url.search)
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }

      // Check if user actually needs to change password
      const { data: invite } = await supabase
        .from('admin_invites')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'activated')
        .single()

      if (!invite) {
        // User doesn't need to change password, redirect to dashboard
        router.push('/admin/dashboard')
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        toast.error("Failed to update password: " + updateError.message)
        return
      }

      // Mark invite as completed (user has changed their temp password)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: updateError } = await supabase
          .from('admin_invites')
          .update({
            status: 'completed',
            activated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Failed to update invite status:', updateError)
          // Don't fail the password change if this update fails
        }
      }

      toast.success("Password changed successfully!")
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error("An error occurred while changing your password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/aulonaflows-logo-dark.svg"
            alt="Aulona Flows"
            width={200}
            height={60}
            className="mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-gray-900">Change Your Password</h2>
          <p className="mt-2 text-gray-600">
            For security, please change your temporary password to a secure one.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Password Change Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Confirm your new password"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}