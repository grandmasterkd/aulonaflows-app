import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, bookingData, paymentMethodId } = body

    const supabase = await createClient()

    // Get event details
    const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const minimumAmount = 0.5 // £0.50 GBP minimum for Stripe
    if (event.price < minimumAmount) {
      return NextResponse.json(
        {
          error: `Minimum payment amount is £${minimumAmount}. Current amount: £${event.price}`,
        },
        { status: 400 },
      )
    }

    // Check for existing booking to prevent duplicates
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", bookingData.user_id)
      .eq("class_id", eventId)
      .single()

    if (existingBooking) {
      return NextResponse.json({ error: "You have already booked this event" }, { status: 400 })
    }

    if (paymentMethodId) {
      // Handle Apple Pay / Payment Request
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(event.price * 100),
        currency: "gbp",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          eventId: eventId,
          notes: JSON.stringify(bookingData),
        },
      })

      // Create booking in database
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: bookingData.user_id || null,
        event_id: eventId,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        has_health_conditions: bookingData.has_health_conditions,
        health_conditions: bookingData.health_conditions || "",
        agreed_to_terms: bookingData.agreed_to_terms,
        payment_status: "paid",
        payment_intent_id: paymentIntent.id,
      })

      if (bookingError) {
        console.error("Error creating booking:", bookingError)
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
      }

      return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id })
    } else {
      // Handle card payment via Checkout
      const isValidImageUrl = (url: string) => {
        try {
          const parsedUrl = new URL(url)
          return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
        } catch {
          return false
        }
      }

      const productImages = event.image_url && isValidImageUrl(event.image_url) ? [event.image_url] : []

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: event.name,
              description: `${event.category} - ${event.location}`,
              images: productImages,
            },
            unit_amount: Math.round(event.price * 100), // Convert to pence
          },
          quantity: 1,
        },
        ],
        mode: "payment",
        success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/book/${eventId}?canceled=true`,
        metadata: {
          eventId: eventId,
          notes: JSON.stringify(bookingData),
        },
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
