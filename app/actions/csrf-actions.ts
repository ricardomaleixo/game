"use server"

import { getOrCreateCsrfToken } from "@/lib/csrf"

// Server Action para obter token CSRF
export async function getCsrfToken(): Promise<string> {
  return await getOrCreateCsrfToken()
}
