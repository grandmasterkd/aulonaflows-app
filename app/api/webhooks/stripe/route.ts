import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { sendBookingConfirmationEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION! as Stripe.LatestApiVersion,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("stripe-sign",signature)


    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.log("signature error",err)
      return NextResponse.json({ error: err || "Invalid signature" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session


      let bookingData: any = {}
      try {
        bookingData = session.metadata?.notes ? JSON.parse(session.metadata.notes) : {}
      } catch (parseError) {
        bookingData = {}
      }

      const customerEmail = bookingData.email || session.customer_details?.email
      const customerName = bookingData.name || session.customer_details?.name || "Unknown"
      const customerPhone = bookingData.phone || ""
      const specialRequirements = bookingData.notes || ""
      const userId = bookingData.user_id || null


      if (customerEmail) {
        const { data: existingClient, error: clientCheckError } = await supabase
          .from("clients")
          .select("id, booking_count")
          .eq("email", customerEmail)
          .single()

        if (clientCheckError && clientCheckError.code !== "PGRST116") {
        }

        if (!existingClient) {
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
            return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
          } else {
          }
        } else {
          const { data: updatedClient, error: updateError } = await supabase
            .from("clients")
            .update({ booking_count: existingClient.booking_count + 1 })
            .eq("email", customerEmail)
            .select()
            .single()

          if (updateError) {
            return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
          } else {
          }
        }
      }

      const eventId = session.metadata?.eventId
      const bundleId = session.metadata?.bundleId
      const bookingId = session.metadata?.bookingId

      if (!eventId && !bundleId && !bookingId) {
        return NextResponse.json({ error: "Missing event, bundle, or booking ID" }, { status: 500 })
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
          return NextResponse.json({ error: "Bundle not found" }, { status: 500 })
        }

        // If bookingId is provided, update existing pending booking
        if (bookingId) {
          const { data: existingBooking, error: updateError } = await supabase
            .from("bookings")
            .update({
              payment_status: "paid",
              status: "confirmed"
            })
            .eq("id", bookingId)
            .eq("payment_status", "pending")
            .eq("user_id", userId)
            .select()
            .single()

          if (updateError || !existingBooking) {
            return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
          }

          bookings.push(existingBooking)
        } else {
          // Check for existing bundle booking to prevent duplicates
          const { data: existingBundleBooking } = await supabase
            .from("bookings")
            .select("id")
            .eq("user_id", userId)
            .eq("bundle_id", bundleId)
            .single()

          if (existingBundleBooking) {
            return NextResponse.json({ error: "Bundle already booked" }, { status: 400 })
          }
        }

        // Create bookings for each event in the bundle (only if no bookingId provided)
        if (!bookingId) {
          for (const bundleEvent of bundle.bundle_events) {
            const event = bundleEvent.events

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
              return NextResponse.json({ error: bookingError || "Failed to create booking" }, { status: 500 })
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
            }
          }
        }

        eventData = { name: bundle.name }
      } else {
        // Handle single event booking

        let booking
        if (bookingId) {
          // Update existing pending booking
          const { data: existingBooking, error: updateError } = await supabase
            .from("bookings")
            .update({
              payment_status: "paid",
              status: "confirmed"
            })
            .eq("id", bookingId)
            .eq("payment_status", "pending")
            .eq("user_id", userId)
            .select()
            .single()

          if (updateError || !existingBooking) {
            return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
          }

          booking = existingBooking
        } else {
          // Check for existing booking to prevent duplicates
          const { data: existingBooking } = await supabase
            .from("bookings")
            .select("id")
            .eq("user_id", userId)
            .eq("class_id", eventId)
            .single()

          if (existingBooking) {
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
              return NextResponse.json({ error: bookingError ||"Failed to create booking" }, { status: 500 })
            }

            booking = newBooking
          }
        }

        bookings.push(booking)

        // Only increment booking count for new bookings, not updates
        if (!bookingId) {
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
          }
        }

        // Get event data
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("name")
          .eq("id", eventId)
          .single()

        if (eventError) {
        }
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

      if (bundleId) {
        paymentData.bundle_id = bundleId
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single()

        console.log("pays:",payment)

      if (paymentError) {
        return NextResponse.json({ error: paymentError || "Failed to create payment record" }, { status: 500 })
      } else {
      }

      //customerEmail && eventData?.name
      if (customerEmail && eventData?.name) {
        const emailResult = await sendBookingConfirmationEmail({
          customerName,
          customerEmail,
          eventName: eventData.name,
          bookingDate: bookings[0].booking_date,
          amount: (session.amount_total || 0) / 100,
          specialRequirements: specialRequirements || undefined,
        })


        if (emailResult?.success) {
        } else {
          // Don't fail the webhook if email fails - booking is still valid
        }
      }

    }

    if (event.type === "payment_intent.payment_failed") {
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
      } else {
      }

    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}