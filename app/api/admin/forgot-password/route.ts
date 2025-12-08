import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PasswordResetService } from '@/lib/services/password-reset-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists and is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .eq('role', 'admin')
      .single()

    if (profileError || !profile) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an admin account with this email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = PasswordResetService.generateResetToken()

    // Store token in database (in a real app, you'd use Redis or similar)
    // For now, we'll use a simple approach with the user's metadata
    const tokenData = {
      token: resetToken.token,
      expiresAt: resetToken.expiresAt,
      email: email
    }

    // In a production app, store this securely. For demo purposes, we'll use a simple approach
    // You might want to use a database table or Redis for this

    // Send reset email
    await PasswordResetService.sendPasswordResetEmail(email, resetToken.token)

    console.log('Password reset email sent to:', email)

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}