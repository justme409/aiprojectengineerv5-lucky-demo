"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Save, AlertCircle } from "lucide-react"

interface NameFormProps {
  initialName?: string
  onNameUpdated?: (name: string) => void
}

export function NameForm({ initialName = "", onNameUpdated }: NameFormProps) {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Name cannot be empty")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // In real implementation, this would call an API to update user name
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setSuccess(true)
      onNameUpdated?.(name.trim())
    } catch (err) {
      setError("Failed to update name. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = name !== initialName

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Update Name
        </CardTitle>
        <CardDescription>
          Change your display name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Name updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Updating..." : "Update Name"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
