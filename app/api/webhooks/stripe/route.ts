import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

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

    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    if (event.type === "checkout.session.completed") {
      console.log("[v0] Processing checkout.session.completed event")
      const session = event.data.object as Stripe.Checkout.Session

      console.log("[v0] Session ID:", session.id)
      console.log("[v0] Session metadata:", session.metadata)
      console.log("[v0] Session amount:", session.amount_total)

      let customerData: any = {}
      try {
        customerData = session.metadata?.notes ? JSON.parse(session.metadata.notes) : {}
      } catch (parseError) {
        console.error("[v0] Error parsing customer data:", parseError)
        customerData = {}
      }

      const customerEmail = customerData.email || session.customer_details?.email
      const customerName =
        customerData.name || session.customer_details?.name || session.metadata?.customerName || "Unknown"

      console.log("[v0] Customer data:", { customerEmail, customerName })

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
              phone: customerData.phone || null,
              location: "Glasgow",
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

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: null,
          class_id: eventId, // This should be a valid UUID from the events table
          booking_date: new Date().toISOString(),
          notes: session.metadata?.notes || "",
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
          name: customerName,
          event: eventData?.name || "Unknown Event",
          date: new Date().toISOString(),
          amount: (session.amount_total || 0) / 100,
          payment_method: "card",
          payment_status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
          booking_id: booking.id,
        })
        .select()
        .single()

      if (paymentError) {
        console.error("[v0] Error creating payment record:", paymentError)
        return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
      } else {
        console.log("[v0] Payment record created:", payment)
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
          name: "Failed Payment",
          event: "Unknown Event",
          date: new Date().toISOString(),
          amount: (paymentIntent.amount || 0) / 100,
          payment_method: "card",
          payment_status: "failed",
          stripe_payment_intent_id: paymentIntent.id,
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
