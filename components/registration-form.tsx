"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { registerAdminAfterPayment } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"

interface RegistrationFormProps {
  sessionId: string
}

export function RegistrationForm({ sessionId }: RegistrationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cpfCnpj: "",
    phone: "",
    email: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const result = await registerAdminAfterPayment({
        name: fullName,
        email: formData.email,
        cpfCnpj: formData.cpfCnpj,
        phone: formData.phone,
        sessionId,
      })

      if (result.success) {
        router.push("/login?firstAccess=true")
      } else {
        setError(result.error || "Erro ao realizar cadastro")
      }
    } catch (err) {
      setError("Erro ao processar cadastro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete seu Cadastro</CardTitle>
        <CardDescription>Pagamento aprovado! Agora precisamos de algumas informações</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processando..." : "Concluir Cadastro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
