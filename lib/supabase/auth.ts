import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  image_url: string | null
}

export interface UserWithProfile {
  user: any
  profile: UserProfile | null
}

// Server-side helper
export async function getUserWithProfile(): Promise<UserWithProfile> {
  const supabase = await createServerClient()

  const {
    data: { user },
   
    error,
  } = await supabase.auth.getUser()
 
  if (error || !user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  

  return { user, profile }
}

// Client-side helper
export async function getUserWithProfileClient(): Promise<UserWithProfile> {
  const supabase = createBrowserClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile doesn't exist, it will be created by the migration script
  // No need to create it here anymore
  return { user, profile }
}
