"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  User,
  Bell,
  Shield,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import { authService, UserProfile, UserPreferences } from "@/lib/services/auth-service"

export default function AccountSettings() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  const [prefsData, setPrefsData] = useState<UserPreferences>({
    notification_email: true,
    notification_sms: false,
    notification_marketing: false,
    preferred_categories: [],
    preferred_locations: [],
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)

    // Initialize form data
    setFormData({
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      phone: currentUser.phone || '',
    })

    // Load preferences
    const userPrefs = await authService.getUserPreferences(currentUser.id)
    if (userPrefs) {
      setPreferences(userPrefs)
      setPrefsData(userPrefs)
    }

    setIsLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      const result = await authService.updateProfile(user.id, formData)
      if (result.success) {
        setUser(result.user!)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      const result = await authService.updatePreferences(user.id, prefsData)
      if (result.success) {
        setPreferences(prefsData)
        setMessage({ type: 'success', text: 'Preferences updated successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update preferences' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <Image src="/aulonaflows-logo-dark.svg" alt="AulonaFlows Logo" width={60} height={60} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/account/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600">Manage your profile and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>



          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notification_email"
                    checked={prefsData.notification_email}
                    onCheckedChange={(checked) =>
                      setPrefsData(prev => ({ ...prev, notification_email: checked as boolean }))
                    }
                  />
                  <Label htmlFor="notification_email">Email notifications for bookings and updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notification_sms"
                    checked={prefsData.notification_sms}
                    onCheckedChange={(checked) =>
                      setPrefsData(prev => ({ ...prev, notification_sms: checked as boolean }))
                    }
                  />
                  <Label htmlFor="notification_sms">SMS notifications for important updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notification_marketing"
                    checked={prefsData.notification_marketing}
                    onCheckedChange={(checked) =>
                      setPrefsData(prev => ({ ...prev, notification_marketing: checked as boolean }))
                    }
                  />
                  <Label htmlFor="notification_marketing">Marketing emails and special offers</Label>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSavePreferences} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}