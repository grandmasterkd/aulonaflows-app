/**
 * Credit and Cancellation Service
 * Handles event credits, refunds, cancellations, and booking modifications
 */

import { createClient as createClientClient } from '@/lib/supabase/client'

export interface EventCredit {
  id: string
  user_id: string
  credit_amount: number
  used_amount: number
  reason: 'refund' | 'cancellation' | 'admin_credit' | 'bundle_adjustment'
  reference_booking_id?: string
  expires_at: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CancellationPolicy {
  refundType: 'full' | 'partial' | 'credit_only' | 'none'
  refundPercentage?: number
  creditAmount: number
  deadline: Date
  reason: string
}

export interface CancellationRequest {
  bookingId: string
  userId: string
  reason: string
  notes?: string
}

export interface RefundResult {
  success: boolean
  refundAmount: number
  creditAmount: number
  error?: string
}

export class CreditService {
  private supabase: any

  constructor() {
    this.supabase = createClientClient()
  }

  /**
   * Calculate cancellation policy for a booking
   */
  async calculateCancellationPolicy(bookingId: string): Promise<CancellationPolicy | null> {
    try {
      // Get booking details with event/bundle info
      const { data: booking, error } = await this.supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            name,
            date_time
          ),
          event_bundles (
            id,
            name
          )
        `)
        .eq('id', bookingId)
        .single()

      if (error || !booking) {
        console.error('Booking not found:', error)
        return null
      }

      const now = new Date()
      let eventDate: Date

      if (booking.bundle_id) {
        // For bundles, find the earliest event date
        const { data: bundleEvents } = await this.supabase
          .from('bundle_events')
          .select('events(date_time)')
          .eq('bundle_id', booking.bundle_id)

        const eventDates = bundleEvents?.map((be: { events: { date_time: string } }) => new Date(be.events.date_time)) || []
        eventDate = new Date(Math.min(...eventDates.map((d: Date) => d.getTime())))
      } else {
        eventDate = new Date(booking.events?.date_time)
      }

      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      const cancellationDeadline = new Date(eventDate.getTime() - (24 * 60 * 60 * 1000)) // 24 hours before

      let policy: CancellationPolicy

      if (hoursUntilEvent >= 168) { // 7+ days
        policy = {
          refundType: 'full',
          creditAmount: 0,
          deadline: cancellationDeadline,
          reason: 'Full refund available - cancelled 7+ days before event'
        }
      } else if (hoursUntilEvent >= 72) { // 3-7 days
        policy = {
          refundType: 'partial',
          refundPercentage: 75,
          creditAmount: booking.amount * 0.25,
          deadline: cancellationDeadline,
          reason: '75% refund available - cancelled 3-7 days before event'
        }
      } else if (hoursUntilEvent >= 24) { // 1-3 days
        policy = {
          refundType: 'credit_only',
          creditAmount: booking.amount,
          deadline: cancellationDeadline,
          reason: 'Event credit issued - cancelled 1-3 days before event'
        }
      } else { // <24 hours
        policy = {
          refundType: 'none',
          creditAmount: 0,
          deadline: cancellationDeadline,
          reason: 'No refund or credit available - cancelled less than 24 hours before event'
        }
      }

      return policy
    } catch (error) {
      console.error('Calculate cancellation policy error:', error)
      return null
    }
  }

  /**
   * Process booking cancellation
   */
  async cancelBooking(request: CancellationRequest): Promise<RefundResult> {
    try {
      const policy = await this.calculateCancellationPolicy(request.bookingId)

      if (!policy) {
        return { success: false, refundAmount: 0, creditAmount: 0, error: 'Unable to calculate cancellation policy' }
      }

      if (policy.refundType === 'none') {
        return { success: false, refundAmount: 0, creditAmount: 0, error: policy.reason }
      }

      // Get booking details
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', request.bookingId)
        .single()

      if (bookingError || !booking) {
        return { success: false, refundAmount: 0, creditAmount: 0, error: 'Booking not found' }
      }

      // Check if user owns the booking
      if (booking.user_id !== request.userId) {
        return { success: false, refundAmount: 0, creditAmount: 0, error: 'Unauthorized' }
      }

      // Check if already cancelled
      if (booking.cancelled_at) {
        return { success: false, refundAmount: 0, creditAmount: 0, error: 'Booking already cancelled' }
      }

      const refundAmount = policy.refundType === 'full' ? booking.amount :
                          policy.refundType === 'partial' ? booking.amount * (policy.refundPercentage! / 100) : 0

      // Start transaction-like operations
      const now = new Date().toISOString()

      // 1. Update booking status
      const { error: updateError } = await this.supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          cancelled_at: now,
          cancellation_requested_at: now,
          refund_amount: refundAmount,
          updated_at: now
        })
        .eq('id', request.bookingId)

      if (updateError) {
        console.error('Update booking error:', updateError)
        return { success: false, refundAmount: 0, creditAmount: 0, error: 'Failed to update booking' }
      }

      // 2. Issue credit if applicable
      if (policy.creditAmount > 0) {
        const creditExpiry = new Date()
        creditExpiry.setFullYear(creditExpiry.getFullYear() + 1) // 1 year expiry

        const { error: creditError } = await this.supabase
          .from('event_credits')
          .insert({
            user_id: request.userId,
            credit_amount: policy.creditAmount,
            reason: 'cancellation',
            reference_booking_id: request.bookingId,
            expires_at: creditExpiry.toISOString(),
            notes: `${request.reason}${request.notes ? ` - ${request.notes}` : ''}`
          })

        if (creditError) {
          console.error('Credit creation error:', creditError)
          // Continue with refund even if credit fails
        }
      }

      // 3. Process refund if applicable (would integrate with Stripe here)
      if (refundAmount > 0 && booking.payment_intent_id) {
        // TODO: Integrate with Stripe refund API
        console.log(`Processing refund of £${refundAmount} for payment intent: ${booking.payment_intent_id}`)
      }

      // 4. Update event booking counts
      if (booking.bundle_id) {
        // For bundles, decrement counts for all events
        const { data: bundleEvents } = await this.supabase
          .from('bundle_events')
          .select('event_id')
          .eq('bundle_id', booking.bundle_id)

        for (const bundleEvent of bundleEvents || []) {
          await this.supabase.rpc('decrement_event_booking_count', {
            event_id: bundleEvent.event_id
          })
        }
      } else {
        // For single events
        await this.supabase.rpc('decrement_event_booking_count', {
          event_id: booking.event_id
        })
      }

      // 5. Log the change
      await this.supabase
        .from('booking_changes')
        .insert({
          booking_id: request.bookingId,
          change_type: 'cancellation',
          old_status: booking.booking_status,
          new_status: 'cancelled',
          old_amount: booking.amount,
          new_amount: 0,
          credit_issued: policy.creditAmount,
          refund_amount: refundAmount,
          user_id: request.userId,
          notes: `${request.reason}${request.notes ? ` - ${request.notes}` : ''}`
        })

      return {
        success: true,
        refundAmount,
        creditAmount: policy.creditAmount
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
      return { success: false, refundAmount: 0, creditAmount: 0, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user credit balance
   */
  async getUserCreditBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_credit_balance', {
        user_uuid: userId
      })

      if (error) {
        console.error('Get credit balance error:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Get credit balance error:', error)
      return 0
    }
  }

  /**
   * Get user credits
   */
  async getUserCredits(userId: string): Promise<EventCredit[]> {
    try {
      const { data, error } = await this.supabase
        .from('event_credits')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })

      if (error) {
        console.error('Get user credits error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get user credits error:', error)
      return []
    }
  }

  /**
   * Apply credit to booking
   */
  async applyCreditToBooking(creditId: string, bookingId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get credit details
      const { data: credit, error: creditError } = await this.supabase
        .from('event_credits')
        .select('*')
        .eq('id', creditId)
        .single()

      if (creditError || !credit) {
        return { success: false, error: 'Credit not found' }
      }

      const availableCredit = credit.credit_amount - credit.used_amount
      if (availableCredit < amount) {
        return { success: false, error: 'Insufficient credit balance' }
      }

      // Update credit used amount
      const { error: updateError } = await this.supabase
        .from('event_credits')
        .update({
          used_amount: credit.used_amount + amount,
          status: (credit.used_amount + amount >= credit.credit_amount) ? 'used' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)

      if (updateError) {
        return { success: false, error: 'Failed to apply credit' }
      }

      // Update booking amount
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('amount')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' }
      }

      const newAmount = Math.max(0, booking.amount - amount)

      const { error: bookingUpdateError } = await this.supabase
        .from('bookings')
        .update({
          amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (bookingUpdateError) {
        return { success: false, error: 'Failed to update booking amount' }
      }

      return { success: true }
    } catch (error) {
      console.error('Apply credit error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Issue admin credit
   */
  async issueAdminCredit(
    userId: string,
    amount: number,
    reason: string,
    adminId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const creditExpiry = new Date()
      creditExpiry.setFullYear(creditExpiry.getFullYear() + 1) // 1 year expiry

      const { error } = await this.supabase
        .from('event_credits')
        .insert({
          user_id: userId,
          credit_amount: amount,
          reason: 'admin_credit',
          expires_at: creditExpiry.toISOString(),
          notes: `Admin credit: ${reason}${notes ? ` - ${notes}` : ''}`
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Issue admin credit error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Process refund (admin function)
   */
  async processRefund(
    bookingId: string,
    refundAmount: number,
    adminId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' }
      }

      // Update booking
      const { error: updateError } = await this.supabase
        .from('bookings')
        .update({
          refund_amount: refundAmount,
          refund_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateError) {
        return { success: false, error: 'Failed to process refund' }
      }

      // Log the change
      await this.supabase
        .from('booking_changes')
        .insert({
          booking_id: bookingId,
          change_type: 'refund',
          old_amount: booking.amount,
          new_amount: booking.amount - refundAmount,
          refund_amount: refundAmount,
          admin_id: adminId,
          notes: `Admin refund of £${refundAmount}`
        })

      // TODO: Integrate with Stripe refund API
      console.log(`Processing refund of £${refundAmount} for booking: ${bookingId}`)

      return { success: true }
    } catch (error) {
      console.error('Process refund error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

// Export singleton instance
export const creditService = new CreditService()