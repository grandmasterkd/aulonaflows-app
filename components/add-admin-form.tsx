"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react"

interface AddAdminFormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface InviteAdminFormData {
  firstName: string
  lastName: string
  email: string
}

export function AddAdminForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<"add" | "invite">("add")



  const [addFormData, setAddFormData] = useState<AddAdminFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [inviteFormData, setInviteFormData] = useState<InviteAdminFormData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  const [addFormErrors, setAddFormErrors] = useState<Partial<AddAdminFormData>>({})
  const [inviteFormErrors, setInviteFormErrors] = useState<Partial<InviteAdminFormData>>({})



  const validateAddForm = () => {
    const errors: Partial<AddAdminFormData> = {}
    if (!addFormData.firstName.trim()) errors.firstName = 'First name is required'
    if (!addFormData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!addFormData.email.trim()) errors.email = 'Email is required'
    if (!addFormData.password.trim()) errors.password = 'Password is required'
    if (addFormData.password && addFormData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setAddFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAddForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: addFormData.firstName,
          lastName: addFormData.lastName,
          email: addFormData.email,
          password: addFormData.password,
          role: 'admin'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Admin added successfully!')
        setAddFormData({ firstName: '', lastName: '', email: '', password: '' })
        setAddFormErrors({})
      } else {
        toast.error(result.error || 'Failed to add admin')
      }
    } catch (error) {
      toast.error('An error occurred while adding the admin')
    } finally {
      setIsLoading(false)
    }
  }

  const validateInviteForm = () => {
    const errors: Partial<InviteAdminFormData> = {}
    if (!inviteFormData.firstName.trim()) errors.firstName = 'First name is required'
    if (!inviteFormData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!inviteFormData.email.trim()) errors.email = 'Email is required'
    setInviteFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInviteForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/invite-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: inviteFormData.firstName,
          lastName: inviteFormData.lastName,
          email: inviteFormData.email,
          role: 'admin'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Invite link sent successfully!')
        setInviteFormData({ firstName: '', lastName: '', email: '' })
        setInviteFormErrors({})
      } else {
        toast.error(result.error || 'Failed to send invite')
      }
    } catch (error) {
      toast.error('An error occurred while sending the invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "add" | "invite")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Directly</TabsTrigger>
            <TabsTrigger value="invite">Send Invite Link</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative mt-1">
                    <Input
                      id="firstName"
                      value={addFormData.firstName}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter first name"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {addFormErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{addFormErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative mt-1">
                    <Input
                      id="lastName"
                      value={addFormData.lastName}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter last name"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {addFormErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{addFormErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    placeholder="Enter email address"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {addFormErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{addFormErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={addFormData.password}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    placeholder="Enter password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {addFormErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{addFormErrors.password}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Adding Admin..." : "Add Admin"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inviteFirstName">First Name</Label>
                  <div className="relative mt-1">
                    <Input
                      id="inviteFirstName"
                      value={inviteFormData.firstName}
                      onChange={(e) => setInviteFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter first name"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {inviteFormErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{inviteFormErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="inviteLastName">Last Name</Label>
                  <div className="relative mt-1">
                    <Input
                      id="inviteLastName"
                      value={inviteFormData.lastName}
                      onChange={(e) => setInviteFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter last name"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {inviteFormErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{inviteFormErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="inviteEmail">Email Address</Label>
                <div className="relative mt-1">
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    placeholder="Enter email address"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {inviteFormErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{inviteFormErrors.email}</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The invite link will allow the recipient to set their own password and complete their admin account setup.
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending Invite..." : "Send Invite Link"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}