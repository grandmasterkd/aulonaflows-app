/**
 * Authentication Service
 * Handles user registration, login, session management, and profile operations
 */

import { createClient as createClientClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  health_conditions?: string
  marketing_consent: boolean
  account_status: 'active' | 'suspended' | 'inactive'
  email_verified: boolean
  phone_verified: boolean
  role: string
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
  password: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  marketing_consent?: boolean
}

export class AuthService {
  private supabase: any

  constructor() {
    this.supabase = createClientClient()
  }

  /**
   * Register a new user account
   */
  async register(data: RegistrationData): Promise<AuthResult> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            date_of_birth: data.date_of_birth,
          }
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' }
      }

      // Create user profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          marketing_consent: data.marketing_consent || false,
          email_verified: false,
          phone_verified: false,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Clean up auth user if profile creation fails
        await this.supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Failed to create user profile' }
      }

      // Create default preferences
      const { error: prefsError } = await this.supabase
        .from('user_preferences')
        .insert({
          user_id: authData.user.id,
          notification_email: true,
          notification_sms: false,
          notification_marketing: data.marketing_consent || false,
        })

      if (prefsError) {
        console.error('Preferences creation error:', prefsError)
        // Non-critical error, continue
      }

      return {
        success: true,
        user: await this.getUserProfile(authData.user.id),
        session: authData.session
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const userProfile = await this.getUserProfile(data.user.id)

      // Check account status
      if (userProfile?.account_status !== 'active') {
        await this.supabase.auth.signOut()
        return {
          success: false,
          error: userProfile?.account_status === 'suspended'
            ? 'Your account has been suspended. Please contact support.'
            : 'Your account is inactive. Please contact support.'
        }
      }

      return {
        success: true,
        user: userProfile,
        session: data.session
      }
    } catch (error) {
      console.error('Sign in error:', error)
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

      // Soft delete by updating status
      const { error } = await this.supabase
        .from('profiles')
        .update({
          account_status: 'inactive',
          updated_at: new Date().toISOString()
        })
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