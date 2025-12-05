import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdminCancellationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, declineReason } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the booking belongs to the user and get booking details with event info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          name,
          date_time,
          location,
          instructor_name
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Participation is already cancelled' },
        { status: 400 }
      )
    }

    // Update booking status and decline reason
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        decline_reason: declineReason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel participation' },
        { status: 500 }
      )
    }

    // Send admin notification email
    try {
      await sendAdminCancellationEmail({
        bookingId,
        declineReason,
        userName: booking.notes?.name || 'Unknown',
        userEmail: booking.notes?.email || 'Unknown',
        userPhone: booking.notes?.phone || 'Unknown',
        eventName: booking.events?.name || 'Unknown Event',
        eventDate: booking.events?.date_time || booking.booking_date,
        eventLocation: booking.events?.location || 'Unknown',
        instructorName: booking.events?.instructor_name || 'Unknown'
      })
    } catch (emailError) {
      console.error('Admin notification email error:', emailError)
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      message: 'Participation cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel participation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}