"use client"

import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ParticipantDashboard } from "@/components/participant-dashboard"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (user?.role === "admin") {
    return <AdminDashboard />
  }

  return <ParticipantDashboard />
}
