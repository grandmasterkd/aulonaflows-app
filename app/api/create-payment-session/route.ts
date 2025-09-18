import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, bookingData } = body

    const supabase = await createClient()

    // Get event details
    const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const minimumAmount = 0.5 // $0.50 USD minimum for Stripe
    if (event.price < minimumAmount) {
      return NextResponse.json(
        {
          error: `Minimum payment amount is $${minimumAmount}. Current amount: $${event.price}`,
        },
        { status: 400 },
      )
    }

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
            currency: "usd",
            product_data: {
              name: event.name,
              description: `${event.category} - ${event.location}`,
              images: productImages,
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/book/${eventId}?canceled=true`,
      metadata: {
        eventId: eventId,
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone,
        notes: bookingData.notes || "",
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
