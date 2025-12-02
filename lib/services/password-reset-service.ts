import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const RESET_TOKEN_EXPIRY = 5 * 60 * 1000 // 5 minutes

export interface PasswordResetToken {
  token: string
  expiresAt: number
}

export class PasswordResetService {
  static generateResetToken(): PasswordResetToken {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + RESET_TOKEN_EXPIRY

    return { token, expiresAt }
  }

  static verifyResetToken(token: string, storedToken: PasswordResetToken): boolean {
    if (token !== storedToken.token) {
      return false
    }

    if (Date.now() > storedToken.expiresAt) {
      return false
    }

    return true
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`

    try {
      await resend.emails.send({
        from: 'Aulona Flows <noreply@aulonaflows.com>',
        to: email,
        subject: 'Reset Your Password - Aulona Flows Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>You requested a password reset for your Aulona Flows admin account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #E3C9A3; color: black; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p>This link will expire in 5 minutes for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Aulona Flows - Admin Portal
            </p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  static async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    try {
      // In a stateless system, we can't validate without additional context
      // The token validation happens in the reset password endpoint
      // This is just a placeholder for future enhancement
      return { valid: true }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false }
    }
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to update password:', error)
      throw new Error('Failed to update password')
    }
  }
}