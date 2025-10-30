"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Save, AlertCircle, Check } from "lucide-react"

interface EmailFormProps {
  initialEmail?: string
  onEmailUpdated?: (email: string) => void
}

export function EmailForm({ initialEmail = "", onEmailUpdated }: EmailFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [currentPassword, setCurrentPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email cannot be empty")
      return
    }

    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    if (email === initialEmail) {
      setError("New email must be different from current email")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // In real implementation, this would call an API to update email
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call

      setVerificationSent(true)
      setSuccess(true)
    } catch (err) {
      setError("Failed to update email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = email !== initialEmail

  if (verificationSent) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-center">Verification email sent</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification email to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Click the link in the email to verify your new email address.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setVerificationSent(false)
              setSuccess(false)
            }}
          >
            Update different email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Update Email
        </CardTitle>
        <CardDescription>
          Change your email address. You&apos;ll need to verify the new email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">New Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your new email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !verificationSent && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Email updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
