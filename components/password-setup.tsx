"use client"

import type React from "react"
import { useState } from "react"
import { setParticipantPassword } from "@/app/actions/auth-actions"
import { useAuth } from "@/hooks/use-auth-prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface PasswordSetupProps {
  user: any
  onPasswordSet: () => void
}

export function PasswordSetup({ user, onPasswordSet }: PasswordSetupProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validações
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      // Definir senha
      const result = await setParticipantPassword(user.id, password)

      if (result.success) {
        // Fazer login automático com a nova senha
        const loginResult = await login(user.email, password)
        if (loginResult.success) {
          onPasswordSet()
        } else {
          setError("Senha configurada, mas erro no login automático. Tente fazer login novamente.")
        }
      } else {
        setError(result.message || "Erro ao definir senha. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao configurar senha:", error)
      setError("Erro interno. Tente novamente.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <span className="text-5xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">Definir Senha</h1>
          <p className="text-muted-foreground text-pretty">
            Olá <strong>{user.name}</strong>! Defina sua senha para acessar o sistema
          </p>
        </div>

        {/* Setup Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <span className="text-lg">🛡️</span>
              <span>Primeira Vez</span>
            </CardTitle>
            <CardDescription className="text-center">Crie uma senha segura para proteger sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite novamente sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Definindo..." : "Definir Senha"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5 flex-shrink-0">✅</span>
                <div className="text-xs space-y-1">
                  <p className="font-medium">Dicas para uma senha segura:</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    <li>• Use pelo menos 6 caracteres</li>
                    <li>• Combine letras e números</li>
                    <li>• Evite informações pessoais</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
