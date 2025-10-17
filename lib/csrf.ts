// CSRF protection utility
import { cookies } from "next/headers"

const CSRF_TOKEN_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"

/**
 * Gera um token CSRF aleatório
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback para Node.js
    const nodeCrypto = require("crypto")
    nodeCrypto.randomFillSync(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Cria ou obtém o token CSRF do cookie
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = cookies()
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)

  if (existingToken?.value) {
    return existingToken.value
  }

  // Criar novo token
  const token = generateToken()

  cookieStore.set({
    name: CSRF_TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 horas
  })

  return token
}

/**
 * Valida o token CSRF da requisição
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)

  if (!storedToken?.value) {
    return false
  }

  // Comparação segura contra timing attacks
  return timingSafeEqual(token, storedToken.value)
}

/**
 * Comparação de strings segura contra timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Middleware para verificar CSRF em Server Actions
 */
export async function requireCsrfToken(token?: string): Promise<void> {
  if (!token) {
    throw new Error("Token CSRF ausente")
  }

  const isValid = await validateCsrfToken(token)

  if (!isValid) {
    throw new Error("Token CSRF inválido")
  }
}

/**
 * Hook para obter token CSRF no cliente
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null
  }

  const cookies = document.cookie.split(";")
  const csrfCookie = cookies.find((c) => c.trim().startsWith(`${CSRF_TOKEN_NAME}=`))

  if (!csrfCookie) {
    return null
  }

  return csrfCookie.split("=")[1]
}
