"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth-prisma"
import { findUserByEmail } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordSetup } from "./password-setup"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [userForSetup, setUserForSetup] = useState<any>(null)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email) {
      setError("Digite seu email")
      setLoading(false)
      return
    }

    try {
      const result = await findUserByEmail(email)

      if (!result.success) {
        setError(result.error || "Email não encontrado. Verifique com o administrador.")
        setLoading(false)
        return
      }

      const user = result.user!

      // Verificar se precisa definir senha
      if (result.needsPasswordSetup) {
        setUserForSetup(user)
        setShowPasswordSetup(true)
        setLoading(false)
        return
      }

      // Se já tem senha, mostrar campo de senha
      setEmailVerified(true)
      setShowPasswordField(true)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao verificar email:", error)
      setError("Erro interno. Tente novamente.")
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        // Redirecionamento bem-sucedido para a página principal
        router.push("/")
        return
      } else {
        setError(result.error || "Senha incorreta")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro interno. Tente novamente.")
    }
    
    setLoading(false)
  }

  const handlePasswordSetComplete = () => {
    setShowPasswordSetup(false)
    setUserForSetup(null)
    // Recarregar a página para fazer login automático
    window.location.reload()
  }

  const handleBackToEmail = () => {
    setShowPasswordField(false)
    setEmailVerified(false)
    setPassword("")
    setError("")
  }

  if (showPasswordSetup && userForSetup) {
    return <PasswordSetup user={userForSetup} onPasswordSet={handlePasswordSetComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center space-x-2 text-3xl sm:text-4xl">
            <span>🏆</span>
            <span>🎯</span>
            <span>🏅</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">Sistema Gamificado</h1>
          <p className="text-muted-foreground text-pretty text-sm sm:text-base">
            Transforme suas vendas em uma competição divertida e motivadora
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {!showPasswordField ? "Digite seu email para continuar" : "Digite sua senha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {!showPasswordField ? (
              // Primeira etapa: apenas email
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verificando..." : "Continuar"}
                </Button>
              </form>
            ) : (
              // Segunda etapa: senha
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-display">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="email-display" type="email" value={email} disabled className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={handleBackToEmail}>
                      ←
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            )}

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-chart-1 mt-0.5 flex-shrink-0">❓</span>
                  <div className="text-xs sm:text-xs space-y-1">
                    <p className="font-medium text-chart-1">Primeira vez no sistema?</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Digite seu email cadastrado pelo administrador. Se for seu primeiro acesso, você será direcionado
                      para criar sua senha automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground text-center mb-2">Credenciais de demonstração:</p>
                <div className="text-xs space-y-1 text-center sm:text-left">
                  <p>
                    <strong>Admin:</strong> admin@empresa.com
                  </p>
                  <p>
                    <strong>Senha:</strong> admin123
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
