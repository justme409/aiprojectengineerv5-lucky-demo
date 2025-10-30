"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Github,
  Mail,
  Building2
} from "lucide-react"

interface OauthSignInProps {
  onProviderSelect?: (provider: string) => void
}

export function OauthSignIn({ onProviderSelect }: OauthSignInProps) {
  const providers = [
    {
      id: "google",
      name: "Google",
      icon: Mail,
      description: "Sign in with your Google account",
      color: "hover:bg-red-50 hover:border-red-200",
      iconColor: "text-red-600"
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: Building2,
      description: "Sign in with Microsoft 365",
      color: "hover:bg-muted hover:border-border",
      iconColor: "text-primary"
    },
    {
      id: "github",
      name: "GitHub",
      icon: Github,
      description: "Sign in with GitHub",
      color: "hover:bg-gray-50 hover:border-gray-200",
      iconColor: "text-gray-900"
    }
  ]

  const handleProviderClick = (providerId: string) => {
    onProviderSelect?.(providerId)
    // In real implementation, this would redirect to OAuth provider
    console.log(`Signing in with ${providerId}`)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Sign in with</CardTitle>
        <CardDescription>
          Choose your preferred sign-in method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className={`w-full justify-start h-auto p-4 ${provider.color}`}
            onClick={() => handleProviderClick(provider.id)}
          >
            <div className="flex items-center gap-3">
              <provider.icon className={`h-5 w-5 ${provider.iconColor}`} />
              <div className="text-left">
                <div className="font-medium">{provider.name}</div>
                <div className="text-xs text-muted-foreground">
                  {provider.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
