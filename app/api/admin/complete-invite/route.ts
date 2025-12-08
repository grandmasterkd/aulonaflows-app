import { NextRequest, NextResponse } from 'next/server'

// This endpoint is deprecated - new invites use the secure temp password flow
// with the /api/admin/activate endpoint instead
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint is no longer supported. Please use the new secure invitation system.',
      message: 'Admin invites now use a secure temporary password flow. Check your email for the latest invitation.'
    },
    { status: 410 } // 410 Gone
  )
}