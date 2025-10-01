"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
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
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Digite email e senha")
      setLoading(false)
      return
    }

    try {
      const result = await login(email, password)
      
      if (result.needsPasswordSetup) {
        // Mostrar formulário de configuração de senha
        setUserForSetup({ id: result.participantId, email, name: email })
        setShowPasswordSetup(true)
      } else if (!result.success) {
        setError(result.error || "Credenciais inválidas")
      }
      // Se result.success for true, o redirecionamento será feito automaticamente
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

  if (showPasswordSetup && userForSetup) {
    return <PasswordSetup user={userForSetup} onPasswordSet={handlePasswordSetComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2 text-4xl">
            <span>🏆</span>
            <span>🎯</span>
            <span>🏅</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">Sistema Gamificado</h1>
          <p className="text-muted-foreground text-pretty">
            Transforme suas vendas em uma competição divertida e motivadora
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-chart-1 mt-0.5 flex-shrink-0">❓</span>
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-chart-1">Primeira vez no sistema?</p>
                    <p className="text-muted-foreground">
                      Digite seu email e qualquer senha. Se for seu primeiro acesso, você será direcionado
                      para criar sua senha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center mb-2">Credenciais de demonstração:</p>
                <div className="text-xs space-y-1">
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
