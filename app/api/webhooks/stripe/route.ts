import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { sendBookingConfirmationEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log("[v0] Webhook received at:", new Date().toISOString())

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("[v0] Webhook body length:", body.length)
    console.log("[v0] Webhook signature present:", !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("[v0] Webhook event constructed successfully:", event.type)
    } catch (err) {
      console.error("[v0] Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    console.log("[v0] Supabase client created")

    if (event.type === "checkout.session.completed") {
      console.log("[v0] Processing checkout.session.completed event")
      const session = event.data.object as Stripe.Checkout.Session

      console.log("[v0] Session ID:", session.id)
      console.log("[v0] Session metadata:", session.metadata)
      console.log("[v0] Session amount:", session.amount_total)

      let bookingData: any = {}
      try {
        bookingData = session.metadata?.notes ? JSON.parse(session.metadata.notes) : {}
      } catch (parseError) {
        console.error("[v0] Error parsing booking data:", parseError)
        bookingData = {}
      }

      const customerEmail = bookingData.email || session.customer_details?.email
      const customerName = bookingData.name || session.customer_details?.name || "Unknown"
      const customerPhone = bookingData.phone || ""
      const specialRequirements = bookingData.notes || ""
      const userId = bookingData.user_id || null

      console.log("[v0] Customer data:", { customerEmail, customerName, customerPhone })

      if (customerEmail) {
        console.log("[v0] Checking for existing client with email:", customerEmail)
        const { data: existingClient, error: clientCheckError } = await supabase
          .from("clients")
          .select("id, booking_count")
          .eq("email", customerEmail)
          .single()

        if (clientCheckError && clientCheckError.code !== "PGRST116") {
          console.error("[v0] Unexpected client check error:", clientCheckError)
        }
        console.log("[v0] Existing client:", existingClient)

        if (!existingClient) {
          console.log("[v0] Creating new client")
          const { data: newClient, error: newClientError } = await supabase
            .from("clients")
            .insert({
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              location: "",
              booking_count: 1,
            })
            .select()
            .single()

          if (newClientError) {
            console.error("[v0] Error creating new client:", newClientError)
            return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
          } else {
            console.log("[v0] New client created:", newClient)
          }
        } else {
          console.log("[v0] Updating existing client booking count")
          const { data: updatedClient, error: updateError } = await supabase
            .from("clients")
            .update({ booking_count: existingClient.booking_count + 1 })
            .eq("email", customerEmail)
            .select()
            .single()

          if (updateError) {
            console.error("[v0] Error updating client:", updateError)
            return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
          } else {
            console.log("[v0] Client updated:", updatedClient)
          }
        }
      }

      console.log("[v0] Creating booking record")
      const eventId = session.metadata?.eventId

      if (!eventId) {
        console.error("[v0] No eventId found in session metadata")
        return NextResponse.json({ error: "Missing event ID" }, { status: 500 })
      }

      const notesObject = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        message: specialRequirements,
      }

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          class_id: eventId,
          booking_date: new Date().toISOString(),
          notes: JSON.stringify(notesObject),
          payment_status: "paid",
          status: "confirmed",
        })
        .select()
        .single()

      if (bookingError) {
        console.error("[v0] Error creating booking:", bookingError)
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
      }

      console.log("[v0] Booking created:", booking)

      console.log("[v0] Updating event booking count")
      const { error: eventUpdateError } = await supabase
        .from("events")
        .update({
          booking_count: (await supabase
            .from("events")
            .select("booking_count")
            .eq("id", eventId)
            .single()).data?.booking_count + 1,
        })
        .eq("id", eventId)

      if (eventUpdateError) {
        console.error("[v0] Error updating event booking count:", eventUpdateError)
      }

      // Get event data
      console.log("[v0] Fetching event data for ID:", eventId)
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .single()

      if (eventError) {
        console.error("[v0] Error fetching event:", eventError)
      }
      console.log("[v0] Event data:", eventData)

      // Create payment record
      console.log("[v0] Creating payment record")
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          booking_id: booking.id,
          amount: (session.amount_total || 0) / 100,
          payment_method: "card",
          status: "paid",
          transaction_id: session.payment_intent as string,
        })
        .select()
        .single()

      if (paymentError) {
        console.error("[v0] Error creating payment record:", paymentError)
        return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
      } else {
        console.log("[v0] Payment record created:", payment)
      }

      if (customerEmail && eventData?.name) {
        console.log("[v0] Sending confirmation email to:", customerEmail)
        const emailResult = await sendBookingConfirmationEmail({
          customerName,
          customerEmail,
          eventName: eventData.name,
          bookingDate: booking.booking_date,
          amount: (session.amount_total || 0) / 100,
          specialRequirements: specialRequirements || undefined,
        })

        if (emailResult.success) {
          console.log("[v0] Confirmation email sent successfully")
        } else {
          console.error("[v0] Failed to send confirmation email:", emailResult.error)
          // Don't fail the webhook if email fails - booking is still valid
        }
      }

      console.log("[v0] Payment processing completed successfully for session:", session.id)
    }

    if (event.type === "payment_intent.payment_failed") {
      console.log("[v0] Processing payment_intent.payment_failed event")
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Record failed payment
      const { data: failedPayment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          amount: (paymentIntent.amount || 0) / 100,
          payment_method: "card",
          status: "failed",
          transaction_id: paymentIntent.id,
        })
        .select()
        .single()

      if (paymentError) {
        console.error("[v0] Error recording failed payment:", paymentError)
      } else {
        console.log("[v0] Failed payment recorded:", failedPayment)
      }

      console.log("[v0] Payment failed processing completed for intent:", paymentIntent.id)
    }

    console.log("[v0] Webhook processing completed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
