import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { eventId, bookingData } = await request.json()
    const supabase = await createClient()

    // Validate required fields
    if (!eventId || !bookingData?.user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for existing booking (prevent duplicates)
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id, payment_status")
      .eq("user_id", bookingData.user_id)
      .eq("class_id", eventId)
      .single()

      console.log("booked:",existingBooking)

    if (existingBooking) {
      if (existingBooking.payment_status === "paid") {
        return NextResponse.json({ error: "You have already booked this event" }, { status: 400 })
      } else {
        // If payment status is not paid (pending, failed, etc.), contact support
        return NextResponse.json({ error: "Unable to book event, contact helpdesk for assistance" }, { status: 400 })
      }
    }

    // Create pending booking
    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: bookingData.user_id,
        class_id: eventId,
        booking_date: new Date().toISOString(),
        notes: JSON.stringify({
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          has_health_conditions: bookingData.has_health_conditions,
          health_conditions: bookingData.health_conditions || "",
          agreed_to_terms: bookingData.agreed_to_terms,
        }),
        payment_status: "pending",
        status: "confirmed"
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating pending booking:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json({ bookingId: newBooking.id })

  } catch (error) {
    console.error("Error in create-pending-booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}