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
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const error = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(`Authentication failed: ${errorDescription || error}`)
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else {
          const supabase = createClient()
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            setStatus('error')
            setMessage('Session establishment failed')
            setTimeout(() => {
              router.push('/auth/login')
            }, 3000)
          } else {
            const user = data.session?.user
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              if (!profile) {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    id: user.id,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || '',
                    email: user.email || '',
                    role: 'user'
                  })

                if (profileError) {
                  setStatus('error')
                  setMessage('Profile creation failed')
                  setTimeout(() => {
                    router.push('/auth/login')
                  }, 3000)
                } else {
                  setStatus('success')
                  setMessage('Welcome! Redirecting...')
                  setTimeout(() => {
                    router.push(returnUrl || '/account/dashboard')
                  }, 2000)
                }
              } else {
                setStatus('success')
                setMessage('Welcome back! Redirecting...')
                setTimeout(() => {
                  if (profile.role === 'admin') {
                    router.push('/admin/dashboard')
                  } else {
                    router.push(returnUrl || '/account/dashboard')
                  }
                }, 2000)
              }
            } else {
              setStatus('error')
              setMessage('No user session found')
              setTimeout(() => {
                router.push('/auth/login')
              }, 3000)
            }
          }
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, returnUrl])

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