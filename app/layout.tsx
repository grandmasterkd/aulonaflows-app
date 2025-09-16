import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const megafield = localFont({
  src: [
    {
      path: "./fonts/Megafield-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Megafield-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-megafield",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Aulona Flows - Yoga Studio Glasgow",
  description:
    "Begin your journey inward with Aulona Flows yoga studio in Glasgow. Offering yoga classes, sound therapy, wellness events, and corporate bookings.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${megafield.variable} font-sans antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
