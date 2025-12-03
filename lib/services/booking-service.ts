/**
 * Booking Service
 * Handles booking creation, management, bundle bookings, and modifications
 */

import { createClient as createClientClient } from '@/lib/supabase/client'
import { calculateBundlePrice } from '@/lib/utils/bundles'

export interface BookingData {
  eventId?: string
  bundleId?: string
  userId: string
  name: string
  email: string
  phone?: string
  notes?: string
  selectedEventIds?: string[] // For bundle modifications
  useCredit?: boolean
  creditAmount?: number
}

export interface BookingResult {
  success: boolean
  bookingId?: string
  bookingReference?: string
  amount: number
  creditApplied: number
  error?: string
}

export interface BookingDetails {
  id: string
  booking_reference: string
  user_id: string
  event_id?: string
  bundle_id?: string
  name: string
  email: string
  phone?: string
  notes?: string
  amount: number
  original_amount: number
  status: string
  payment_status: string
  booking_date: string
  cancellation_deadline?: string
  refund_eligibility: string
  cancelled_at?: string
  refund_processed_at?: string
  created_at: string
  updated_at: string
  events?: Array<{
    id: string
    name: string
    date_time: string
    location: string
    instructor_name: string
  }>
  bundle?: {
    id: string
    name: string
    description: string
  }
}

export class BookingService {
  private supabase: any

  constructor() {
    this.supabase = createClientClient()
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingData): Promise<BookingResult> {
    try {
      let finalAmount = 0
      let creditApplied = 0

      if (bookingData.bundleId) {
        // Bundle booking
        const { data: bundle, error: bundleError } = await this.supabase
          .from('event_bundles')
          .select(`
            *,
            bundle_events (
              events (*)
            )
          `)
          .eq('id', bookingData.bundleId)
          .single()

        if (bundleError || !bundle) {
          return { success: false, amount: 0, creditApplied: 0, error: 'Bundle not found' }
        }

        // Filter events if specific ones selected
        let selectedEvents = bundle.bundle_events?.map((be: any) => be.events) || []
        if (bookingData.selectedEventIds && bookingData.selectedEventIds.length > 0) {
          selectedEvents = selectedEvents.filter((event: any) =>
            bookingData.selectedEventIds!.includes(event.id)
          )
        }

        const pricing = calculateBundlePrice(selectedEvents)
        finalAmount = pricing.discountedTotal

        // Apply credit if requested
        if (bookingData.useCredit && bookingData.creditAmount) {
          const availableCredit = await this.getUserCreditBalance(bookingData.userId)
          creditApplied = Math.min(bookingData.creditAmount, availableCredit, finalAmount)
          finalAmount = Math.max(0, finalAmount - creditApplied)
        }

        // Create booking
        const { data: booking, error: bookingError } = await this.supabase
          .from('bookings')
          .insert({
            bundle_id: bookingData.bundleId,
            user_id: bookingData.userId,
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            notes: bookingData.notes,
            amount: finalAmount,
            original_amount: pricing.discountedTotal,
            booking_status: 'confirmed',
            payment_status: finalAmount === 0 ? 'paid' : 'pending'
          })
          .select()
          .single()

        if (bookingError) {
          return { success: false, amount: finalAmount, creditApplied, error: bookingError.message }
        }

        // Update booking counts for selected events
        for (const event of selectedEvents) {
          await this.supabase.rpc('increment_event_booking_count', { event_id: event.id })
        }

        // Apply credit if used
        if (creditApplied > 0) {
          await this.applyCreditToBooking(bookingData.userId, creditApplied, `Bundle booking: ${bundle.name}`)
        }

        return {
          success: true,
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
          amount: finalAmount,
          creditApplied
        }

      } else if (bookingData.eventId) {
        // Single event booking
        const { data: event, error: eventError } = await this.supabase
          .from('events')
          .select('*')
          .eq('id', bookingData.eventId)
          .single()

        if (eventError || !event) {
          return { success: false, amount: 0, creditApplied: 0, error: 'Event not found' }
        }

        finalAmount = event.price

        // Apply credit if requested
        if (bookingData.useCredit && bookingData.creditAmount) {
          const availableCredit = await this.getUserCreditBalance(bookingData.userId)
          creditApplied = Math.min(bookingData.creditAmount, availableCredit, finalAmount)
          finalAmount = Math.max(0, finalAmount - creditApplied)
        }

        // Create booking
        const { data: booking, error: bookingError } = await this.supabase
          .from('bookings')
          .insert({
            event_id: bookingData.eventId,
            user_id: bookingData.userId,
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            notes: bookingData.notes,
            amount: finalAmount,
            original_amount: event.price,
            booking_status: 'confirmed',
            payment_status: finalAmount === 0 ? 'paid' : 'pending'
          })
          .select()
          .single()

        if (bookingError) {
          return { success: false, amount: finalAmount, creditApplied, error: bookingError.message }
        }

        // Update booking count
        await this.supabase.rpc('increment_event_booking_count', { event_id: bookingData.eventId })

        // Apply credit if used
        if (creditApplied > 0) {
          await this.applyCreditToBooking(bookingData.userId, creditApplied, `Event booking: ${event.name}`)
        }

        return {
          success: true,
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
          amount: finalAmount,
          creditApplied
        }
      }

      return { success: false, amount: 0, creditApplied: 0, error: 'Invalid booking data' }
    } catch (error) {
      console.error('Create booking error:', error)
      return { success: false, amount: 0, creditApplied: 0, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string): Promise<BookingDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          class_id,
          booking_date,
          status,
          payment_status,
          notes,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get user bookings error:', error)
        return []
      }

      // Fetch event details for each booking
      const bookingsWithEvents = await Promise.all((data || []).map(async (booking) => {
        if (booking.class_id) {
          const { data: event } = await this.supabase
            .from('events')
            .select('id, name, date_time, location, instructor_name')
            .eq('id', booking.class_id)
            .single()

          return { ...booking, events: event ? [event] : [] }
        }
        return { ...booking, events: [] }
      }))

      return bookingsWithEvents
    } catch (error) {
      console.error('Get user bookings error:', error)
      return []
    }
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string, userId?: string): Promise<BookingDetails | null> {
    try {
      let query = this.supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            name,
            date_time,
            location,
            instructor_name
          ),
          event_bundles (
            id,
            name,
            description
          )
        `)
        .eq('id', bookingId)

      // If userId provided, ensure user owns the booking
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        console.error('Get booking details error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get booking details error:', error)
      return null
    }
  }

  /**
   * Modify bundle booking (add/remove events)
   */
  async modifyBundleBooking(
    bookingId: string,
    userId: string,
    selectedEventIds: string[]
  ): Promise<{ success: boolean; error?: string; newAmount?: number }> {
    try {
      // Get current booking
      const booking = await this.getBookingDetails(bookingId, userId)
      if (!booking || !booking.bundle_id) {
        return { success: false, error: 'Bundle booking not found' }
      }

      // Get bundle events
      const { data: bundleEvents, error: bundleError } = await this.supabase
        .from('bundle_events')
        .select('events(*)')
        .eq('bundle_id', booking.bundle_id)

      if (bundleError) {
        return { success: false, error: 'Failed to load bundle events' }
      }

      const availableEvents = bundleEvents?.map((be: any) => be.events) || []
      const selectedEvents = availableEvents.filter((event: any) =>
        selectedEventIds.includes(event.id)
      )

      if (selectedEvents.length < 2) {
        return { success: false, error: 'Bundle must include at least 2 events' }
      }

      // Calculate new pricing
      const pricing = calculateBundlePrice(selectedEvents)
      const priceDifference = pricing.discountedTotal - booking.original_amount

      // Update booking
      const { error: updateError } = await this.supabase
        .from('bookings')
        .update({
          amount: pricing.discountedTotal,
          original_amount: pricing.discountedTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateError) {
        return { success: false, error: 'Failed to update booking' }
      }

      // Log the modification
      await this.supabase
        .from('bundle_modifications')
        .insert({
          bundle_id: booking.bundle_id,
          booking_id: bookingId,
          modification_type: 'bundle_modification',
          price_adjustment: priceDifference,
          user_id: userId,
          notes: `Modified bundle to include ${selectedEvents.length} events`
        })

      return { success: true, newAmount: pricing.discountedTotal }
    } catch (error) {
      console.error('Modify bundle booking error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user credit balance (helper)
   */
  private async getUserCreditBalance(userId: string): Promise<number> {
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
   * Apply credit to user account (helper)
   */
  private async applyCreditToBooking(userId: string, amount: number, reason: string): Promise<void> {
    try {
      // Find available credits to use
      const { data: credits, error } = await this.supabase
        .from('event_credits')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })

      if (error || !credits) return

      let remainingAmount = amount

      for (const credit of credits) {
        if (remainingAmount <= 0) break

        const availableCredit = credit.credit_amount - credit.used_amount
        const useAmount = Math.min(remainingAmount, availableCredit)

        await this.supabase
          .from('event_credits')
          .update({
            used_amount: credit.used_amount + useAmount,
            status: (credit.used_amount + useAmount >= credit.credit_amount) ? 'used' : 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', credit.id)

        remainingAmount -= useAmount
      }
    } catch (error) {
      console.error('Apply credit error:', error)
    }
  }

  /**
   * Check if user can book event/bundle
   */
  async canUserBook(userId: string, eventId?: string, bundleId?: string): Promise<{ canBook: boolean; reason?: string }> {
    try {
      // Check account status
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('account_status')
        .eq('id', userId)
        .single()

      if (profileError || profile?.account_status !== 'active') {
        return { canBook: false, reason: 'Account is not active' }
      }

      if (eventId) {
        // Check event availability
        const { data: event, error: eventError } = await this.supabase
          .from('events')
          .select('capacity, current_bookings, status')
          .eq('id', eventId)
          .single()

        if (eventError || !event) {
          return { canBook: false, reason: 'Event not found' }
        }

        if (event.status !== 'active') {
          return { canBook: false, reason: 'Event is not available' }
        }

        if (event.current_bookings >= event.capacity) {
          return { canBook: false, reason: 'Event is fully booked' }
        }

        // Check if user already booked this event
        const { data: existingBooking } = await this.supabase
          .from('bookings')
          .select('id')
          .eq('user_id', userId)
          .eq('event_id', eventId)
          .eq('booking_status', 'confirmed')
          .single()

        if (existingBooking) {
          return { canBook: false, reason: 'You have already booked this event' }
        }
      }

      if (bundleId) {
        // Check bundle availability - all events must be available
        const { data: bundleEvents, error: bundleError } = await this.supabase
          .from('bundle_events')
          .select(`
            events (
              id,
              capacity,
              current_bookings,
              status
            )
          `)
          .eq('bundle_id', bundleId)

        if (bundleError) {
          return { canBook: false, reason: 'Bundle not found' }
        }

        for (const bundleEvent of bundleEvents || []) {
          const event = bundleEvent.events
          if (event.status !== 'active') {
            return { canBook: false, reason: 'One or more events in this bundle are not available' }
          }
          if (event.current_bookings >= event.capacity) {
            return { canBook: false, reason: 'One or more events in this bundle are fully booked' }
          }
        }

        // Check if user already booked this bundle
        const { data: existingBooking } = await this.supabase
          .from('bookings')
          .select('id')
          .eq('user_id', userId)
          .eq('bundle_id', bundleId)
          .eq('booking_status', 'confirmed')
          .single()

        if (existingBooking) {
          return { canBook: false, reason: 'You have already booked this bundle' }
        }
      }

      return { canBook: true }
    } catch (error) {
      console.error('Can user book error:', error)
      return { canBook: false, reason: 'An error occurred while checking availability' }
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService()