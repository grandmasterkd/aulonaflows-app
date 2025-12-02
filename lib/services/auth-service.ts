/**
 * Authentication Service
 * Handles user registration, login, session management, and profile operations
 */

import { createClient as createClientClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  notification_email: boolean
  notification_sms: boolean
  notification_marketing: boolean
  preferred_categories: string[]
  preferred_locations: string[]
}

export interface AuthResult {
  success: boolean
  user?: UserProfile | null
  session?: Session
  error?: string
}

export interface RegistrationData {
  email: string
  first_name: string
  last_name: string
}

export class AuthService {
  private supabase: any

  constructor() {
    this.supabase = createClientClient()
  }

  /**
   * Send magic link for user registration/signin
   */
  async sendMagicLink(email: string, role: 'user' | 'admin' = 'user', userData?: { first_name?: string; last_name?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      // Redirect to callback page first, then callback handles final redirect
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL
      if (!baseUrl && typeof window !== 'undefined') {
        baseUrl = window.location.origin
      } else if (baseUrl && typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
        // Override production URL for localhost development
        baseUrl = window.location.origin
      }
      baseUrl = baseUrl || 'http://localhost:3000'
      const callbackUrl = `${baseUrl}/auth/callback`
      console.log('Sending magic link to:', email, 'baseUrl:', baseUrl, 'callback URL:', callbackUrl, 'window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A')

      const metadata: any = { role }
      if (userData?.first_name && userData?.last_name) {
        metadata.first_name = userData.first_name
        metadata.last_name = userData.last_name
        metadata.display_name = `${userData.first_name} ${userData.last_name}`
      }

      console.log('Magic link metadata:', metadata)

      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl,
          data: metadata,
        },
      })

      if (error) {
        console.error('Supabase signInWithOtp error:', error)
        return { success: false, error: error.message }
      }

      console.log('Magic link sent successfully')
      return { success: true }
    } catch (error) {
      console.error('Send magic link error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Handle magic link callback and create profile if needed
   */
  async handleMagicLinkCallback(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.getSession()

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.session?.user) {
        return { success: false, error: 'No session found' }
      }

      const user = data.session.user
      const role = user.user_metadata?.role || 'user'

      // Check if profile exists
      let profile = await this.getUserProfile(user.id)

      if (!profile) {
        // Create profile with metadata
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          return { success: false, error: 'Failed to create user profile' }
        }

        profile = await this.getUserProfile(user.id)
      } else {
        // Update existing profile with any missing data from metadata
        const updates: any = {}
        if (!profile.first_name && user.user_metadata?.first_name) {
          updates.first_name = user.user_metadata.first_name
        }
        if (!profile.last_name && user.user_metadata?.last_name) {
          updates.last_name = user.user_metadata.last_name
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await this.supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

          if (updateError) {
            console.error('Profile update error:', updateError)
          } else {
            profile = await this.getUserProfile(user.id)
          }
        }
      }

      return {
        success: true,
        user: profile,
        session: data.session
      }
    } catch (error) {
      console.error('Magic link callback error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign in user with magic link (for users)
   */
  async signIn(email: string): Promise<{ success: boolean; error?: string }> {
    return this.sendMagicLink(email, 'user')
  }

  /**
   * Sign in admin with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.session?.user) {
        return { success: false, error: 'No session found' }
      }

      const user = data.session.user

      // Check if user is admin
      let profile = await this.getUserProfile(user.id)

      if (!profile) {
        // Create profile if not exists (for existing admins)
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role: 'admin',
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          return { success: false, error: 'Failed to create user profile' }
        }

        profile = await this.getUserProfile(user.id)
      }

      if (profile?.role !== 'Admin') {
        await this.supabase.auth.signOut()
        return { success: false, error: 'Access denied. Admin privileges required.' }
      }

      return {
        success: true,
        user: profile,
        session: data.session
      }
    } catch (error) {
      console.error('Password sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'apple' | 'microsoft'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, url: data.url }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.getSession()

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.session?.user) {
        return { success: false, error: 'No session found' }
      }

      const user = data.session.user

      // Check if user profile exists, create if not
      let userProfile = await this.getUserProfile(user.id)

      if (!userProfile) {
        // Create profile for OAuth user
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            role: 'user',
          })

        if (profileError) {
          console.error('OAuth profile creation error:', profileError)
          return { success: false, error: 'Failed to create user profile' }
        }



        userProfile = await this.getUserProfile(user.id)
      }



      return {
        success: true,
        user: userProfile,
        session: data.session
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      return await this.getUserProfile(user.id)
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        console.error('Get user profile error:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data as UserProfile }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Update preferences error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        console.error('Get user preferences error:', error)
        return null
      }

      return {
        notification_email: data.notification_email,
        notification_sms: data.notification_sms,
        notification_marketing: data.notification_marketing,
        preferred_categories: data.preferred_categories || [],
        preferred_locations: data.preferred_locations || [],
      }
    } catch (error) {
      console.error('Get user preferences error:', error)
      return null
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update email_verified status
      const { data: { user } } = await this.supabase.auth.getUser()
      if (user) {
        await this.supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', user.id)
      }

      return { success: true }
    } catch (error) {
      console.error('Verify email error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(userId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if admin
      const adminProfile = await this.getUserProfile(adminId)
      if (!adminProfile || adminProfile.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
      }

      // Soft delete by updating status (if account_status exists, otherwise hard delete)
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user session info
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }
}

// Export singleton instance
export const authService = new AuthService()