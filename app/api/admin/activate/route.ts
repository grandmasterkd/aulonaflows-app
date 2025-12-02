import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Activation token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Find the invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > new Date(invite.expires_at)) {
      // Mark invite as expired
      await supabase
        .from('admin_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)

      return NextResponse.json(
        { error: 'Activation token has expired' },
        { status: 400 }
      )
    }

    // Note: Email confirmation is now handled during account creation
    // This activation step primarily serves to mark the invite as activated
    // and provide user feedback that activation was successful

    // Update invite status to activated
    const { error: updateError } = await supabase
      .from('admin_invites')
      .update({
        status: 'activated',
        activated_at: new Date().toISOString()
      })
      .eq('id', invite.id)

    if (updateError) {
      console.error('Invite update error:', updateError)
      // Don't fail the request if this update fails, as the account is already activated
    }

    // Create the admin record
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        id: invite.user_id,
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        role: invite.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (adminError) {
      console.error('Admin creation error:', adminError)
      return NextResponse.json(
        { error: 'Failed to create admin record' },
        { status: 500 }
      )
    }

    // Create profile record for dashboard authentication
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: invite.user_id,
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        role: 'Admin', // Capital A to match dashboard auth check
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the entire activation if profile creation fails
      // The admin record was created successfully
    }

    return NextResponse.json({
      message: 'Account activated successfully',
      email: invite.email,
      firstName: invite.first_name,
      lastName: invite.last_name
    })

  } catch (error) {
    console.error('Activate account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}