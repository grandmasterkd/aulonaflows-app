import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, payment_status, user_id")
      .eq("id", params.id)
      .eq("payment_status", "pending")
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found or not in pending status" }, { status: 404 })
    }

    return NextResponse.json({
      verified: true,
      bookingId: booking.id,
      userId: booking.user_id
    })

  } catch (error) {
    console.error("Error verifying booking:", error)
    return NextResponse.json({ error: "Failed to verify booking" }, { status: 500 })
  }
}