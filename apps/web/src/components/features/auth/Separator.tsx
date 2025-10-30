"use client"

import { cn } from "@/lib/utils"

interface SeparatorProps {
  text?: string
  className?: string
}

export function Separator({ text = "or", className }: SeparatorProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  )
}
