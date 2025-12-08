"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/services/auth-service"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { CheckCircle, XCircle } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      console.log('Auth callback started, URL params:', Object.fromEntries(searchParams.entries()))

      // Check for error parameters in URL
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        console.error('Auth callback error:', { error, errorCode, errorDescription })
        setStatus('error')
        setMessage(`Authentication failed: ${errorDescription || error}`)
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
        return
      }

      // Check for tokens in URL (for manual session establishment)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        // Manually set the session
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.error('Session establishment error:', sessionError)
          setStatus('error')
          setMessage('Failed to establish session')
          setTimeout(() => {
            router.push('/auth/login')
          }, 5000)
          return
        }
      }

      // Handle the callback
      const result = await authService.handleMagicLinkCallback()

      if (result.success && result.user) {
        setStatus('success')
        setMessage('Successfully signed in! Redirecting...')

        setTimeout(() => {
          // Redirect based on user role
          if (result.user!.role === 'admin') {
            router.push('/admin/dashboard')
          } else if (returnUrl) {
            router.push(returnUrl)
          } else {
            router.push('/account/dashboard')
          }
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Authentication failed')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error) {
      console.error('Callback error:', error)
      setStatus('error')
      setMessage('An unexpected error occurred')
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/aulonaflows-logo-dark.svg"
            alt="AulonaFlows"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />

          <div className="mt-8">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#654625] mx-auto"></div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              </div>
            )}

            <p className="text-gray-600 mt-4">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}