import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PasswordResetService } from '@/lib/services/password-reset-service'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // In a stateless system, we need to decode the token to get user info
    // For this demo, we'll use a simple approach
    // In production, you'd validate the token against stored data

    const supabase = await createClient()

    // For demo purposes, we'll assume the token contains user info
    // In a real app, you'd have a secure token system
    try {
      // This is a simplified approach - in production, use proper JWT or secure tokens
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const tokenData = JSON.parse(decoded)

      if (!tokenData.email || !tokenData.expiresAt) {
        throw new Error('Invalid token format')
      }

      if (Date.now() > tokenData.expiresAt) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 400 }
        )
      }

      // Get user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', tokenData.email)
        .eq('role', 'admin')
        .single()

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'Invalid token or user not found' },
          { status: 400 }
        )
      }

      // Update password
      await PasswordResetService.updatePassword(profile.id, newPassword)

      return NextResponse.json({
        message: 'Password reset successfully'
      })

    } catch (decodeError) {
      console.error('Token decode error:', decodeError)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}