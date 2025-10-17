"use client"

import { useEffect, useState } from "react"
import { getCsrfToken } from "@/app/actions/csrf-actions"

// Hook para obter e gerenciar token CSRF no cliente
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchToken() {
      try {
        const csrfToken = await getCsrfToken()
        setToken(csrfToken)
      } catch (error) {
        console.error("Erro ao obter token CSRF:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, isLoading }
}
