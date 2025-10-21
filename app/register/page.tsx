"use client"

import { useSearchParams } from "next/navigation"
import { RegistrationForm } from "@/components/registration-form"
import { Suspense } from "react"
import { LoadingTrophy } from "@/components/loading-trophy"

function RegisterContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sessão Inválida</h1>
          <p className="text-muted-foreground">Não foi possível encontrar sua sessão de pagamento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegistrationForm sessionId={sessionId} />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingTrophy size="lg" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
