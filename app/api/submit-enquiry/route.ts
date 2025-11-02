import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, country, state, message } = await request.json()

    // Validate required fields
    if (!name || !email || !country || !state || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Insert enquiry into database
    const { data, error } = await supabase
      .from("enquiries")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          country: country.trim(),
          state: state.trim(),
          message: message.trim(),
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting enquiry:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: `Failed to submit enquiry: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Enquiry submitted successfully",
        data: data[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error processing enquiry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}