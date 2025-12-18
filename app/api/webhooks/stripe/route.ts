import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { sendBookingConfirmationEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log(" Webhook received at:", new Date().toISOString())

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("Webhook body length:", body.length)
    console.log("Webhook signature present:", !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("Webhook event constructed successfully:", event.type)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    console.log(" Supabase client created")

    if (event.type === "checkout.session.completed") {
      console.log(" Processing checkout.session.completed event")
      const session = event.data.object as Stripe.Checkout.Session

      console.log(" Session ID:", session.id)
      console.log(" Session metadata:", session.metadata)
      console.log(" Session amount:", session.amount_total)

      let bookingData: any = {}
      try {
        bookingData = session.metadata?.notes ? JSON.parse(session.metadata.notes) : {}
      } catch (parseError) {
        console.error(" Error parsing booking data:", parseError)
        bookingData = {}
      }

      const customerEmail = bookingData.email || session.customer_details?.email
      const customerName = bookingData.name || session.customer_details?.name || "Unknown"
      const customerPhone = bookingData.phone || ""
      const specialRequirements = bookingData.notes || ""
      const userId = bookingData.user_id || null

      console.log(" Customer data:", { customerEmail, customerName, customerPhone })

      if (customerEmail) {
        console.log(" Checking for existing client with email:", customerEmail)
        const { data: existingClient, error: clientCheckError } = await supabase
          .from("clients")
          .select("id, booking_count")
          .eq("email", customerEmail)
          .single()

        if (clientCheckError && clientCheckError.code !== "PGRST116") {
          console.error(" Unexpected client check error:", clientCheckError)
        }
        console.log(" Existing client:", existingClient)

        if (!existingClient) {
          console.log(" Creating new client")
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
            console.error(" Error creating new client:", newClientError)
            return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
          } else {
            console.log(" New client created:", newClient)
          }
        } else {
          console.log(" Updating existing client booking count")
          const { data: updatedClient, error: updateError } = await supabase
            .from("clients")
            .update({ booking_count: existingClient.booking_count + 1 })
            .eq("email", customerEmail)
            .select()
            .single()

          if (updateError) {
            console.error(" Error updating client:", updateError)
            return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
          } else {
            console.log(" Client updated:", updatedClient)
          }
        }
      }

      const eventId = session.metadata?.eventId
      const bundleId = session.metadata?.bundleId

      if (!eventId && !bundleId) {
        console.error(" No eventId or bundleId found in session metadata")
        return NextResponse.json({ error: "Missing event or bundle ID" }, { status: 500 })
      }

      const notesObject = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        message: specialRequirements,
      }

      let bookings: any[] = []
      let eventData: any = null

      if (bundleId) {
        // Handle bundle booking
        console.log(" Processing bundle booking for bundleId:", bundleId)

        // Fetch bundle with events
        const { data: bundle, error: bundleError } = await supabase
          .from("event_bundles")
          .select(`
            *,
            bundle_events (
              events (*)
            )
          `)
          .eq("id", bundleId)
          .single()

        if (bundleError || !bundle) {
          console.error(" Bundle not found:", bundleError)
          return NextResponse.json({ error: "Bundle not found" }, { status: 500 })
        }

        // Check for existing bundle booking to prevent duplicates
        const { data: existingBundleBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", userId)
          .eq("bundle_id", bundleId)
          .single()

        if (existingBundleBooking) {
          console.log(" Bundle booking already exists")
          return NextResponse.json({ error: "Bundle already booked" }, { status: 400 })
        }

        // Create bookings for each event in the bundle
        for (const bundleEvent of bundle.bundle_events) {
          const event = bundleEvent.events
          console.log(" Creating booking for event:", event.id)

          const { data: newBooking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
              user_id: userId,
              class_id: event.id,
              bundle_id: bundleId,
              booking_date: new Date().toISOString(),
              notes: JSON.stringify(notesObject),
              payment_status: "paid",
              status: "confirmed",
            })
            .select()
            .single()

          if (bookingError) {
            console.error(" Error creating booking for event", event.id, ":", bookingError)
            return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
          }

          bookings.push(newBooking)

          // Update event booking count
          const { error: eventUpdateError } = await supabase
            .from("events")
            .update({
              booking_count: (await supabase
                .from("events")
                .select("booking_count")
                .eq("id", event.id)
                .single()).data?.booking_count + 1,
            })
            .eq("id", event.id)

          if (eventUpdateError) {
            console.error(" Error updating event booking count for", event.id, ":", eventUpdateError)
          }
        }

        eventData = { name: bundle.name }
      } else {
        // Handle single event booking
        console.log(" Processing single event booking for eventId:", eventId)

        // Check for existing booking to prevent duplicates
        const { data: existingBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", userId)
          .eq("class_id", eventId)
          .single()

        let booking
        if (existingBooking) {
          console.log(" Booking already exists, using existing booking")
          booking = existingBooking
        } else {
          const { data: newBooking, error: bookingError } = await supabase
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
            console.error(" Error creating booking:", bookingError)
            return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
          }

          console.log(" Booking created:", newBooking)
          booking = newBooking
        }

        bookings.push(booking)

        console.log(" Updating event booking count")
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
          console.error(" Error updating event booking count:", eventUpdateError)
        }

        // Get event data
        console.log(" Fetching event data for ID:", eventId)
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("name")
          .eq("id", eventId)
          .single()

        if (eventError) {
          console.error(" Error fetching event:", eventError)
        }
        console.log(" Event data:", event)
        eventData = event
      }

      // Create payment record
      
      const paymentData: any = {
        name: customerName,
        event: bundleId ? "Bundle Purchase" : eventData?.name || "Event Purchase",
        date: new Date().toISOString(),
        amount: (session.amount_total || 0) / 100,
        payment_method: "card",
        payment_status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        booking_id: bookings[0].id,
      }
      console.log(" Creating payment record",paymentData)

      if (bundleId) {
        paymentData.bundle_id = bundleId
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single()

      if (paymentError) {
        console.error(" Error creating payment record:", paymentError)
        return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
      } else {
        console.log(" Payment record created:", payment)
      }

      //customerEmail && eventData?.name
      if (eventData) {
        console.log("event:",eventData)
        console.log(" Sending confirmation email to:", customerEmail)
        const emailResult = await sendBookingConfirmationEmail({
          customerName,
          customerEmail,
          eventName: eventData.name,
          bookingDate: bookings[0].booking_date,
          amount: (session.amount_total || 0) / 100,
          specialRequirements: specialRequirements || undefined,
        })

        console.log("emailresult:",emailResult)

        if (emailResult.success) {
          console.log(" Confirmation email sent successfully")
        } else {
          console.error(" Failed to send confirmation email:", emailResult.error)
          // Don't fail the webhook if email fails - booking is still valid
        }
      }

      console.log(" Payment processing completed successfully for session:", session.id)
    }

    if (event.type === "payment_intent.payment_failed") {
      console.log(" Processing payment_intent.payment_failed event")
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
        console.error(" Error recording failed payment:", paymentError)
      } else {
        console.log(" Failed payment recorded:", failedPayment)
      }

      console.log(" Payment failed processing completed for intent:", paymentIntent.id)
    }

    console.log(" Webhook processing completed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(" Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}