"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Force light theme for auth pages
    setTheme("light")
  }, [setTheme])

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
