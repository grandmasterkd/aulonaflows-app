import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  eventName: string
  bookingDate: string
  amount: number
  specialRequirements?: string
}

export async function sendBookingConfirmationEmail({
  customerName,
  customerEmail,
  eventName,
  bookingDate,
  amount,
  specialRequirements,
}: BookingConfirmationEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Resto Refine Studios <hello@restorefine.com>",
      to: [customerEmail],
      subject: `Booking Confirmed - ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed! 🎉</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName},</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                Thank you for booking with Aulona Flows! We're excited to have you join us. Here are your booking details:
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
                <p style="margin: 8px 0;"><strong>Event:</strong> ${eventName}</p>
                <p style="margin: 8px 0;"><strong>Booking Date:</strong> ${new Date(bookingDate).toLocaleDateString(
                  "en-GB",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}</p>
                <p style="margin: 8px 0;"><strong>Amount Paid:</strong> £${amount.toFixed(2)}</p>
                ${specialRequirements ? `<p style="margin: 8px 0;"><strong>Special Requirements:</strong> ${specialRequirements}</p>` : ""}
              </div>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="margin-top: 0; color: #0066cc;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>We'll send you a reminder email closer to the event date</li>
                  <li>Please arrive 10 minutes early for check-in</li>
                  <li>Bring comfortable clothing and a water bottle</li>
                  <li>If you have any questions, don't hesitate to contact us</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                We can't wait to see you at the event! If you need to make any changes or have questions, 
                please contact us as soon as possible.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 5px 0; color: #666;">
                  <strong>Aulona Flows</strong><br>
                  Email: info@aulonaflows.com<br>
                  Phone: +44 123 456 7890
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                This is an automated confirmation email. Please keep this for your records.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Email sending error:", error)
      return { success: false, error }
    }

    console.log("[v0] Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    return { success: false, error }
  }
}
