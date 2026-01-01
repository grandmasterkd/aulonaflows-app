import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, bundleId, bookingData, paymentMethodId } = body

    const supabase = await createClient()

    let totalPrice: number
    let itemName: string
    let itemDescription: string
    let productImages: string[] = []
    let metadata: any = { notes: JSON.stringify(bookingData) }


    const { } = await supabase .from("bookings").insert({ bookingData : bookingData })


    if (bundleId) {
      // Handle bundle booking
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
        return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
      }

      totalPrice = bundle.total_price
      itemName = bundle.name
      itemDescription = bundle.description || "Bundle package"
      metadata.bundleId = bundleId

      // Check for existing bundle booking to prevent duplicates
      const { data: existingBundleBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", bookingData.user_id)
        .eq("bundle_id", bundleId)
        .single()

      if (existingBundleBooking) {
        return NextResponse.json({ error: "You have already booked this bundle" }, { status: 400 })
      }
    } else if (eventId) {
      // Handle single event booking
      const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", eventId).single()

      if (eventError || !event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      totalPrice = event.price
      itemName = event.name
      itemDescription = `${event.category} - ${event.location}`
      metadata.eventId = eventId

      // Check for existing booking to prevent duplicates
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id, payment_status")
        .eq("user_id", bookingData.user_id)
        .eq("class_id", eventId)
        .single()

      if (existingBooking?.payment_status === "paid") {
        return NextResponse.json({ error: "You have already booked this event of thursday" }, { status: 400 })
      } else {
        "Unable to book event, contact helpdesk for assistance"
      }

      // Set product images for single event
      const isValidImageUrl = (url: string) => {
        try {
          const parsedUrl = new URL(url)
          return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
        } catch {
          return false
        }
      }
      productImages = event.image_url && isValidImageUrl(event.image_url) ? [event.image_url] : []
    } else {
      return NextResponse.json({ error: "Either eventId or bundleId must be provided" }, { status: 400 })
    }

    const minimumAmount = 0.5 // £0.50 GBP minimum for Stripe
    if (totalPrice < minimumAmount) {
      return NextResponse.json(
        {
          error: `Minimum payment amount is £${minimumAmount}. Current amount: £${totalPrice}`,
        },
        { status: 400 },
      )
    }

    if (paymentMethodId) {
      // Handle Apple Pay / Payment Request
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: "gbp",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      })

      // For bundles, we can't create bookings here as payment is async
      // Bookings will be created in the webhook
      if (!bundleId) {
        // Create booking in database for single events
        const { error: bookingError } = await supabase.from("bookings").insert({
          user_id: bookingData.user_id || null,
          class_id: eventId,
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
      }

      return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id })
    } else {
      // Handle card payment via Checkout
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: itemName,
              description: itemDescription,
              images: productImages,
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to pence
          },
          quantity: 1,
        },
        ],
        mode: "payment",
        success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: bundleId
          ? `${request.nextUrl.origin}/book/bundle/${bundleId}?canceled=true`
          : `${request.nextUrl.origin}/book/${eventId}?canceled=true`,
        metadata,
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json({ error: error || "Failed to create payment session" }, { status: 500 })
  }
}
