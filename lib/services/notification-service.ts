/**
 * Notification Service
 * Handles email notifications, SMS, and in-app notifications
 */

import { createClient as createClientClient } from '@/lib/supabase/client'
import { Resend } from 'resend'

const RESEND_API_KEY = process?.env?.RESEND_API_KEY

export interface NotificationData {
  userId: string
  type: 'booking_confirmation' | 'payment_success' | 'cancellation_confirmed' | 'refund_processed' | 'credit_issued' | 'credit_expiring' | 'bundle_modified' | 'event_reminder' | 'event_update'
  subject: string
  content: string
  metadata?: Record<string, any>
  priority?: 1 | 2 | 3 | 4 | 5 // 1=low, 5=critical
  scheduledFor?: Date
}

export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

export class NotificationService {
  private supabase: any
  private resend: Resend | null = null

  constructor() {
    this.supabase = createClientClient()
    // Only initialize Resend on server side
    if (typeof window === 'undefined') {
      this.resend = new Resend(process.env.RESEND_API_KEY!)
    }
  }

  /**
   * Send notification (queue for async processing)
   */
  async sendNotification(data: NotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user email
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('email')
        .eq('id', data.userId)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User not found' }
      }

      // Check user preferences
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', data.userId)
        .single()

      // Skip if user has disabled this notification type
      if (data.type === 'event_reminder' && !preferences?.notification_email) {
        return { success: true } // Not an error, just skipped
      }

      // Queue notification
      const { error: queueError } = await this.supabase
        .from('notification_queue')
        .insert({
          user_id: data.userId,
          notification_type: data.type,
          email: profile.email,
          subject: data.subject,
          content: data.content,
          metadata: data.metadata || {},
          priority: data.priority || 3,
          scheduled_for: data.scheduledFor?.toISOString() || new Date().toISOString()
        })

      if (queueError) {
        console.error('Queue notification error:', queueError)
        return { success: false, error: 'Failed to queue notification' }
      }

      return { success: true }
    } catch (error) {
      console.error('Send notification error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Generate email template for booking confirmation
   */
  generateBookingConfirmationEmail(booking: any, events: any[], bundle?: any): EmailTemplate {
    const eventList = events.map(event =>
      `- ${event.name} on ${new Date(event.date_time).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} at ${event.location}`
    ).join('\n')

    const subject = bundle ? `Bundle Booking Confirmed: ${bundle.name}` : `Event Booking Confirmed: ${events[0]?.name}`

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #654625;">Booking Confirmed!</h1>

        ${bundle ? `
          <h2>Bundle: ${bundle.name}</h2>
          ${bundle.description ? `<p>${bundle.description}</p>` : ''}
        ` : ''}

        <h3>Your Events:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${eventList.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details:</h3>
          <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
          <p><strong>Name:</strong> ${booking.name}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          ${booking.phone ? `<p><strong>Phone:</strong> ${booking.phone}</p>` : ''}
          <p><strong>Total Amount:</strong> £${booking.amount}</p>
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Important Information:</h3>
          <ul>
            <li>Please arrive 10 minutes before your event starts</li>
            <li>Bring comfortable clothing and a water bottle</li>
            <li>Cancellation policy: 24 hours notice required for events, 48 hours for special events</li>
            <li>Late cancellations may incur charges</li>
          </ul>
        </div>

        <p>If you need to make changes to your booking, please contact us at least 24 hours in advance.</p>

        <p style="margin-top: 30px;">We look forward to seeing you!</p>
        <p><strong>AulonaFlows Team</strong></p>
      </div>
    `

    const textContent = `
Booking Confirmed!

${bundle ? `Bundle: ${bundle.name}\n${bundle.description ? `${bundle.description}\n\n` : ''}` : ''}

Your Events:
${eventList}

Booking Details:
Booking Reference: ${booking.booking_reference}
Name: ${booking.name}
Email: ${booking.email}
${booking.phone ? `Phone: ${booking.phone}\n` : ''}Total Amount: £${booking.amount}
${booking.notes ? `Notes: ${booking.notes}\n` : ''}

Important Information:
- Please arrive 10 minutes before your event starts
- Bring comfortable clothing and a water bottle
- Cancellation policy: 24 hours notice required for events, 48 hours for special events
- Late cancellations may incur charges

If you need to make changes to your booking, please contact us at least 24 hours in advance.

We look forward to seeing you!
AulonaFlows Team
    `.trim()

    return { subject, htmlContent, textContent }
  }

  /**
   * Generate email template for cancellation confirmation
   */
  generateCancellationEmail(booking: any, refundAmount: number, creditAmount: number): EmailTemplate {
    const subject = `Booking Cancelled: ${booking.booking_reference}`

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc3545;">Booking Cancelled</h1>

        <p>Your booking has been successfully cancelled.</p>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Cancellation Details:</h3>
          <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
          <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
        </div>

        ${refundAmount > 0 ? `
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">Refund Processed</h3>
            <p>A refund of <strong>£${refundAmount}</strong> has been processed and should appear in your account within 5-7 business days.</p>
          </div>
        ` : ''}

        ${creditAmount > 0 ? `
          <div style="background: #cce5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #004085;">Credit Issued</h3>
            <p>An event credit of <strong>£${creditAmount}</strong> has been added to your account. This credit can be used for future bookings and expires in 12 months.</p>
            <p>You can view your credit balance in your account dashboard.</p>
          </div>
        ` : ''}

        <p>If you have any questions about this cancellation, please don't hesitate to contact us.</p>

        <p style="margin-top: 30px;">Thank you for your understanding.</p>
        <p><strong>AulonaFlows Team</strong></p>
      </div>
    `

    const textContent = `
Booking Cancelled

Your booking has been successfully cancelled.

Cancellation Details:
Booking Reference: ${booking.booking_reference}
Cancelled On: ${new Date().toLocaleDateString('en-GB')}

${refundAmount > 0 ? `Refund Processed\nA refund of £${refundAmount} has been processed and should appear in your account within 5-7 business days.\n\n` : ''}${creditAmount > 0 ? `Credit Issued\nAn event credit of £${creditAmount} has been added to your account. This credit can be used for future bookings and expires in 12 months.\nYou can view your credit balance in your account dashboard.\n\n` : ''}If you have any questions about this cancellation, please don't hesitate to contact us.

Thank you for your understanding.
AulonaFlows Team
    `.trim()

    return { subject, htmlContent, textContent }
  }

  /**
   * Generate email template for credit expiry warning
   */
  generateCreditExpiryWarning(credits: any[]): EmailTemplate {
    const totalExpiring = credits.reduce((sum, credit) => sum + (credit.credit_amount - credit.used_amount), 0)

    const subject = `Event Credit Expiring Soon - £${totalExpiring}`

        const creditList = (credits as any[]).map((credit: any) =>
          `- £${credit.credit_amount - credit.used_amount} expires on ${new Date(credit.expires_at).toLocaleDateString('en-GB')}`
        ).join('\n')

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #856404;">Event Credit Expiring Soon</h1>

        <p>You have event credits that are about to expire. Don't miss out on using them!</p>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Expiring Credits:</h3>
          ${creditList.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
          <p style="margin-top: 10px;"><strong>Total Expiring: £${totalExpiring}</strong></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/credits"
             style="background: #654625; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Credits
          </a>
        </div>

        <p>Credits can be used for individual events or event bundles. Book now to make the most of your credits before they expire!</p>

        <p style="margin-top: 30px;">Happy booking!</p>
        <p><strong>AulonaFlows Team</strong></p>
      </div>
    `

    const textContent = `
Event Credit Expiring Soon

You have event credits that are about to expire. Don't miss out on using them!

Expiring Credits:
${creditList}

Total Expiring: £${totalExpiring}

Credits can be used for individual events or event bundles. Book now to make the most of your credits before they expire!

Visit your account to view and use your credits.

Happy booking!
AulonaFlows Team
    `.trim()

    return { subject, htmlContent, textContent }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select(`
          *,
          events (*),
          event_bundles (*)
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' }
      }

      let events: any[] = []
      let bundle: any = null

      if (booking.bundle_id) {
        // Get bundle events
        const { data: bundleEvents } = await this.supabase
          .from('bundle_events')
          .select('events(*)')
          .eq('bundle_id', booking.bundle_id)

        events = bundleEvents?.map((be: any) => be.events) || []
        bundle = booking.event_bundles
      } else {
        events = [booking.events]
      }

      const template = this.generateBookingConfirmationEmail(booking, events, bundle)

      return this.sendNotification({
        userId: booking.user_id,
        type: 'booking_confirmation',
        subject: template.subject,
        content: template.htmlContent,
        metadata: { bookingId, bookingReference: booking.booking_reference },
        priority: 4 // High priority
      })
    } catch (error) {
      console.error('Send booking confirmation error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Send cancellation confirmation
   */
  async sendCancellationConfirmation(
    bookingId: string,
    refundAmount: number,
    creditAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: booking, error: bookingError } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' }
      }

      const template = this.generateCancellationEmail(booking, refundAmount, creditAmount)

      return this.sendNotification({
        userId: booking.user_id,
        type: 'cancellation_confirmed',
        subject: template.subject,
        content: template.htmlContent,
        metadata: { bookingId, refundAmount, creditAmount },
        priority: 4
      })
    } catch (error) {
      console.error('Send cancellation confirmation error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Send credit expiry warnings (batch job)
   */
  async sendCreditExpiryWarnings(): Promise<{ processed: number; errors: number }> {
    try {
      // Find credits expiring in 7 days
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)

      const { data: expiringCredits, error } = await this.supabase
        .from('event_credits')
        .select('*')
        .eq('status', 'active')
        .lte('expires_at', expiryDate.toISOString())
        .gt('expires_at', new Date().toISOString())

      if (error || !expiringCredits) {
        console.error('Find expiring credits error:', error)
        return { processed: 0, errors: 1 }
      }

      // Group by user
      const creditsByUser = expiringCredits.reduce((acc: any, credit: any) => {
        if (!acc[credit.user_id]) {
          acc[credit.user_id] = []
        }
        acc[credit.user_id].push(credit)
        return acc
      }, {})

      let processed = 0
      let errors = 0

      for (const [userId, credits] of Object.entries(creditsByUser) as [string, any[]][]) {
        try {
          const template = this.generateCreditExpiryWarning(credits as any[])
          await this.sendNotification({
            userId,
            type: 'credit_expiring',
            subject: template.subject,
            content: template.htmlContent,
            metadata: { expiringCredits: credits },
            priority: 2
          })
          processed++
        } catch (error) {
          console.error(`Send credit expiry warning error for user ${userId}:`, error)
          errors++
        }
      }

      return { processed, errors }
    } catch (error) {
      console.error('Send credit expiry warnings error:', error)
      return { processed: 0, errors: 1 }
    }
  }

  /**
   * Process notification queue (background job)
   */
  async processNotificationQueue(): Promise<{ processed: number; errors: number }> {
    try {
      // Get pending notifications ready to send
      const { data: notifications, error } = await this.supabase
        .from('notification_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50) // Process in batches

      if (error || !notifications) {
        console.error('Get notification queue error:', error)
        return { processed: 0, errors: 1 }
      }

      let processed = 0
      let errors = 0

      for (const notification of notifications) {
        try {
          // Send email using Resend
          if (!this.resend) {
            throw new Error('Email service not available')
          }

          const { data: emailData, error: emailError } = await this.resend.emails.send({
            from: "Aulona Flows <contact@aulonaflows.com>",
            to: [notification.email],
            subject: notification.subject,
            html: notification.content,
          })

          if (emailError) {
            throw new Error(`Email sending failed: ${emailError.message}`)
          }

          console.log(`Sent ${notification.notification_type} email to ${notification.email}: ${notification.subject}`)

          await this.supabase
            .from('notification_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id)

          processed++
        } catch (error) {
          console.error(`Process notification error for ${notification.id}:`, error)

          // Update retry count
          const newRetryCount = notification.retry_count + 1
          const newStatus = newRetryCount >= notification.max_retries ? 'failed' : 'pending'

          await this.supabase
            .from('notification_queue')
            .update({
              status: newStatus,
              retry_count: newRetryCount,
              error_message: error instanceof Error ? error.message : 'Unknown error',
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id)

          errors++
        }
      }

      return { processed, errors }
    } catch (error) {
      console.error('Process notification queue error:', error)
      return { processed: 0, errors: 1 }
    }
  }

  /**
   * Generate email template for event update notifications
   */
  generateEventUpdateEmail(
    event: any,
    changes: Record<string, { old: any; new: any }>,
    bookingReference: string
  ): EmailTemplate {
    const changeList = Object.entries(changes)
      .map(([field, change]) => {
        const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        const oldValue = this.formatFieldValue(field, change.old)
        const newValue = this.formatFieldValue(field, change.new)
        return `${fieldName}: ${oldValue} → ${newValue}`
      })
      .join('\n')

    const subject = `Event Update: ${event.name}`

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #654625;">Event Update Notification</h1>

        <p>Important updates have been made to an event you have booked:</p>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #654625;">${event.name}</h3>
          <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        </div>

        <h3>Changes Made:</h3>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${changeList.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Updated Event Details:</h3>
          <p><strong>Date & Time:</strong> ${new Date(event.date_time).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Instructor:</strong> ${event.instructor_name}</p>
          <p><strong>Price:</strong> £${event.price}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">Important Information:</h3>
          <ul>
            <li>Please review the updated event details above</li>
            <li>If you have any concerns about these changes, please contact us as soon as possible</li>
            <li>Cancellation policy still applies - please refer to your booking confirmation</li>
          </ul>
        </div>

        <p>If you need to make changes to your booking or have questions, please contact us.</p>

        <p style="margin-top: 30px;">Thank you for your understanding.</p>
        <p><strong>AulonaFlows Team</strong></p>
      </div>
    `

    const textContent = `
Event Update Notification

Important updates have been made to an event you have booked.

Event: ${event.name}
Booking Reference: ${bookingReference}

Changes Made:
${changeList}

Updated Event Details:
Date & Time: ${new Date(event.date_time).toLocaleDateString('en-GB', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
Location: ${event.location}
Instructor: ${event.instructor_name}
Price: £${event.price}

Important Information:
- Please review the updated event details above
- If you have any concerns about these changes, please contact us as soon as possible
- Cancellation policy still applies - please refer to your booking confirmation

If you need to make changes to your booking or have questions, please contact us.

Thank you for your understanding.
AulonaFlows Team
    `.trim()

    return { subject, htmlContent, textContent }
  }

  /**
   * Send event update notification
   */
  async sendEventUpdateNotification(
    userIdentifier: string,
    event: any,
    changes: Record<string, { old: any; new: any }>,
    bookingReference: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Determine if userIdentifier is userId or email
      let userId: string
      let email: string

      // Check if it's a UUID (userId) or email
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (uuidRegex.test(userIdentifier)) {
        userId = userIdentifier
        // Get email from profiles
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single()

        if (profileError || !profile) {
          return { success: false, error: 'User not found' }
        }
        email = profile.email
      } else {
        email = userIdentifier
        userId = userIdentifier // For guest users, use email as identifier
      }

      const template = this.generateEventUpdateEmail(event, changes, bookingReference)

      return this.sendNotification({
        userId,
        type: 'event_update',
        subject: template.subject,
        content: template.htmlContent,
        metadata: { eventId: event.id, changes, bookingReference },
        priority: 4 // High priority
      })
    } catch (error) {
      console.error('Send event update notification error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Helper method to format field values for display
   */
  private formatFieldValue(field: string, value: any): string {
    if (value === null || value === undefined) return 'Not set'

    switch (field) {
      case 'date_time':
        return new Date(value).toLocaleDateString('en-GB', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      case 'price':
        return `£${value}`
      default:
        return String(value)
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()