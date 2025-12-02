import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email } = await request.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Check if email already exists
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.' },
        { status: 400 }
      )
    }

    // TODO: Profile creation moved to magic link callback due to schema constraints
    // For now, just validate uniqueness and redirect to login
    // Profile will be created when magic link is processed

    return NextResponse.json({
      message: 'Account created successfully. Please log in with your email.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}