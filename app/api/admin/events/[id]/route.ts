import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notificationService } from '@/lib/services/notification-service'

interface EventUpdateData {
  name?: string
  category?: string
  description?: string
  date_time?: string
  location?: string
  capacity?: number
  price?: number
  instructor_name?: string
  image_url?: string
  status?: string
  [key: string]: any // Allow indexing
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const updateData: EventUpdateData = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
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

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update events' },
        { status: 403 }
      )
    }

    // Get current event data before update
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (fetchError || !currentEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (updateError) {
      console.error('Event update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    // Detect changes in relevant fields
    const relevantFields = ['name', 'date_time', 'location', 'price', 'instructor_name']
    const changes: Record<string, { old: any; new: any }> = {}

    for (const field of relevantFields) {
      if (updateData[field] !== undefined && currentEvent[field] !== updateData[field]) {
        changes[field] = {
          old: currentEvent[field],
          new: updateData[field]
        }
      }
    }

    // If there are changes, send notifications to booked users
    if (Object.keys(changes).length > 0) {
      try {
        await sendEventUpdateNotifications(eventId, changes, updatedEvent)
      } catch (notificationError) {
        console.error('Failed to send event update notifications:', notificationError)
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent,
      notificationsSent: Object.keys(changes).length > 0
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendEventUpdateNotifications(
  eventId: string,
  changes: Record<string, { old: any; new: any }>,
  updatedEvent: any
) {
  const supabase = await createClient()

  // Find all bookings for this event (single event bookings)
  const { data: singleBookings, error: singleError } = await supabase
    .from('bookings')
    .select('user_id, email, booking_reference')
    .eq('event_id', eventId)
    .eq('booking_status', 'confirmed')

  if (singleError) {
    console.error('Error fetching single bookings:', singleError)
  }

  // Find all bookings for bundles that include this event
  const { data: bundleBookings, error: bundleError } = await supabase
    .from('bundle_events')
    .select(`
      bundle_id,
      bookings!inner (
        user_id,
        email,
        booking_reference,
        booking_status
      )
    `)
    .eq('event_id', eventId)

  if (bundleError) {
    console.error('Error fetching bundle bookings:', bundleError)
  }

  // Collect all unique users to notify
  const usersToNotify: Array<{ userId?: string; email: string; bookingReference: string }> = []

  // Process single bookings
  if (singleBookings) {
    for (const booking of singleBookings) {
      usersToNotify.push({
        userId: booking.user_id,
        email: booking.email,
        bookingReference: booking.booking_reference
      })
    }
  }

  // Process bundle bookings
  if (bundleBookings) {
    for (const bundleEvent of bundleBookings) {
      for (const booking of bundleEvent.bookings as any[]) {
        if (booking.booking_status === 'confirmed') {
          usersToNotify.push({
            userId: booking.user_id,
            email: booking.email,
            bookingReference: booking.booking_reference
          })
        }
      }
    }
  }

  // Remove duplicates based on email
  const uniqueUsers = usersToNotify.filter((user, index, self) =>
    index === self.findIndex(u => u.email === user.email)
  )

  // Send notifications
  for (const user of uniqueUsers) {
    try {
      await notificationService.sendEventUpdateNotification(
        user.userId || user.email,
        updatedEvent,
        changes,
        user.bookingReference
      )
    } catch (error) {
      console.error(`Failed to send notification to ${user.email}:`, error)
    }
  }

  console.log(`Sent event update notifications to ${uniqueUsers.length} users`)
}