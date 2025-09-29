"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { authService, type User, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (name: string, email: string, role: "admin" | "participant") => User
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })

  useEffect(() => {
    setAuthState(authService.getAuthState())
  }, [])

  const login = (email: string, password: string): boolean => {
    const user = authService.login(email, password)
    if (user) {
      setAuthState({ user, isAuthenticated: true })
      return true
    }
    return false
  }

  const logout = () => {
    authService.logout()
    setAuthState({ user: null, isAuthenticated: false })
  }

  const register = (name: string, email: string, role: "admin" | "participant"): User => {
    return authService.register(name, email, role)
  }

  return <AuthContext.Provider value={{ ...authState, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
