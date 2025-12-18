import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent} from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

async function PaymentSuccessContent({ sessionId, paymentIntentId }: { sessionId?: string; paymentIntentId?: string }) {
  const supabase = await createClient()

  let payment = null
  let currentUser = null
  if (sessionId) {
    // Get payment details for checkout
    const { data } = await supabase.from("payments").select("*").eq("stripe_session_id", sessionId).single()
    payment = data

    const { data: user } = await supabase.from("profiles").select("*").single()
    if (!user) {
      return <div>User not found</div>
    }

    currentUser = user
  } else if (paymentIntentId) {
    // For Apple Pay, we can fetch from Stripe or show generic
    // Since we don't store in payments table, show basic success
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] w-full max-w-md p-7 md:p-10 rounded-3xl">
          <div className="text-left space-y-1">
          <Image src="/aulonaflows-logo-dark.svg" alt="aulona-flows-logo" width={40} height={40} className="aspect-auto object-contain" />
           <h3 className="text-2xl font-medium tracking-tighter">Payment Successful!</h3>
           <p className="text-xs text-black/50" > Hello {`${ currentUser?.first_name + " " + currentUser?.last_name }`}, thank you for your booking. Your payment has been processed successfully. </p>
          </div>
          
          {payment && (
            <div className="py-8 flex flex-wrap gap-4 items-start justify-between" >
              <ul className="text-base font-medium space-y-1" >
                <li>Event Booked</li>
                <li>Booking Date</li>
                <li>Booking Status</li>
                <li>Amount Paid</li>
              </ul>

              <ul className="text-base font-medium text-black/50 capitalize space-y-1" >
                <li>{payment?.event}</li>
                <li>{new Date(payment.date).toLocaleDateString()}</li>
                <li>{payment.payment_status}</li>
                <li>£{payment.amount}</li>
              </ul>
            </div> 
          )}

          <div>
            <hr className="text-black/20"/>
            <p className="pt-1 text-xs text-gray-600">
             A confirmation email has been sent to your email address with the event details 
            </p>
          </div>
          

          <div className="w-full pt-5 flex flex-wrap gap-2">
            <button className="bg-[#E3C9A3] hover:bg-opacity-50 transition-all ease-linear duration-300 rounded-lg px-2 h-12 flex-1 font-medium text-sm whitespace-nowrap">
                <Link href="/book">Back to Events</Link>
            </button>
            <button className="flex-1 rounded-lg px-2 h-12 bg-[#F7BA4C] hover:bg-opacity-50 transition-all ease-linear duration-300 font-medium text-sm whitespace-nowrap">
                <Link href="/">Done</Link>
            </button>
          </div>
      </div>
    </main>
  )
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Invalid payment session</p>
            <Button asChild className="w-full mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent sessionId={sessionId} />
    </Suspense>
  )
}
