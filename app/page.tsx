"use client"

import { useAuth } from "@/hooks/use-auth-prisma"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ParticipantDashboard } from "@/components/participant-dashboard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (user?.role === "admin") {
    return <AdminDashboard />
  }

  return <ParticipantDashboard />
}
