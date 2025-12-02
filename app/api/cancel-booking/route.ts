import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notificationService } from '@/lib/services/notification-service'

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

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

    // Verify the booking belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking can be cancelled (not too close to event date)
    const eventDate = new Date(booking.event_date)
    const now = new Date()
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilEvent < 24) {
      return NextResponse.json(
        { error: 'Bookings cannot be cancelled less than 24 hours before the event' },
        { status: 400 }
      )
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    // Calculate refund and credit amounts
    let refundAmount = 0
    let creditAmount = 0

    if (booking.payment_status === 'paid' && booking.total_amount > 0) {
      // Refund 80% of the amount
      refundAmount = Math.round(booking.total_amount * 0.8)

      // Issue credit for the remaining 20%
      creditAmount = booking.total_amount - refundAmount
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        refund_amount: refundAmount,
        credit_issued: creditAmount
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // Issue credit if applicable
    if (creditAmount > 0) {
      const { error: creditError } = await supabase
        .from('event_credits')
        .insert({
          user_id: user.id,
          amount: creditAmount,
          reason: `Cancellation credit for booking ${booking.booking_reference}`,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
          status: 'active'
        })

      if (creditError) {
        console.error('Credit issuance error:', creditError)
        // Don't fail the cancellation if credit fails, just log it
      }
    }

    // Send notification email
    await notificationService.sendCancellationConfirmation(
      bookingId,
      refundAmount,
      creditAmount
    )

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      refundAmount,
      creditAmount
    })

  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}