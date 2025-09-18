import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function PaymentSuccessContent({ sessionId }: { sessionId: string }) {
  const supabase = await createClient()

  // Get payment details
  const { data: payment } = await supabase.from("payments").select("*").eq("stripe_session_id", sessionId).single()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p>Thank you for your booking. Your payment has been processed successfully.</p>
          </div>

          {payment && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>${payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize text-green-600">{payment.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(payment.date).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to your email address with booking details.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
