"use client"

import { Trophy } from "lucide-react"

interface LoadingTrophyProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingTrophy({ message, size = "md" }: LoadingTrophyProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        {/* Círculo de fundo com gradiente */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 opacity-20 blur-xl animate-pulse" />

        {/* Troféu rotacionando */}
        <Trophy
          className={`${sizeClasses[size]} text-yellow-500 animate-spin relative z-10`}
          style={{
            animationDuration: "2s",
            filter: "drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))",
          }}
        />
      </div>

      {message && <p className={`${textSizeClasses[size]} text-muted-foreground animate-pulse`}>{message}</p>}
    </div>
  )
}
