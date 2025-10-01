"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { getCurrentUser, loginUser, logoutUser, type AuthUser, type AuthState } from "@/app/actions/auth-actions"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser()
      setAuthState({ user, isAuthenticated: !!user })
    } catch (error) {
      console.error("Erro ao obter usuário:", error)
      setAuthState({ user: null, isAuthenticated: false })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginUser(email, password)
      if (result.success && result.user) {
        setAuthState({ user: result.user, isAuthenticated: true })
        return { success: true }
      } else {
        return { success: false, error: result.error || "Erro no login" }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      return { success: false, error: "Erro interno" }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutUser()
      setAuthState({ user: null, isAuthenticated: false })
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Compatibilidade com o sistema antigo
export type { AuthUser as User, AuthState }