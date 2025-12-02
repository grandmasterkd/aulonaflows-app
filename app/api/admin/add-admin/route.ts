import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    const adminSupabase = createAdminClient()

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

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can add new admins' },
        { status: 403 }
      )
    }

    // Check if user with this email already exists in admins table (using admin client to bypass RLS)
    const { data: existingAdmin } = await adminSupabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
      email_confirm: true
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account', details: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user?.id) {
      console.error('Auth user creation succeeded but user ID is missing')
      return NextResponse.json(
        { error: 'Failed to create user account - user ID missing' },
        { status: 500 }
      )
    }

    // Create the admin entry
    const { error: adminInsertError, data: adminData } = await adminSupabase
      .from('admins')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (adminInsertError) {
      console.error('Admin creation error:', adminInsertError)
      console.error('Error details:', JSON.stringify(adminInsertError, null, 2))
      console.error('Attempted insert data:', {
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
      })
      // Try to clean up the auth user if admin creation failed
      try {
        await adminSupabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Failed to clean up auth user:', deleteError)
      }
      return NextResponse.json(
        { 
          error: 'Failed to create admin account',
          details: adminInsertError.message,
          code: adminInsertError.code,
          hint: adminInsertError.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin created successfully',
      userId: authData.user?.id
    })

  } catch (error) {
    console.error('Add admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}