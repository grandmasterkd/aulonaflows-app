 import { NextRequest, NextResponse } from 'next/server'
 import { createClient } from '@/lib/supabase/server'
 import { authService } from '@/lib/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, role } = await request.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid role. Only admin role is allowed.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the current user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can send invites' },
        { status: 403 }
      )
    }

    // Check if user with this email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Send magic link to the invited admin with metadata
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          role: 'admin',
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`
        },
      },
    })

    if (error) {
      console.error('Failed to send magic link:', error)
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin invitation sent successfully'
    })

  } catch (error) {
    console.error('Invite admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}