"use client"

import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { LoadingTrophy } from "@/components/loading-trophy"

function LoginContent() {
  const searchParams = useSearchParams()
  const firstAccess = searchParams.get("firstAccess")

  return (
    <div>
      {firstAccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-medium">Cadastro realizado com sucesso!</p>
          <p className="text-green-600 text-sm">Faça login com seu email para definir sua senha</p>
        </div>
      )}
      <LoginForm />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingTrophy size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
