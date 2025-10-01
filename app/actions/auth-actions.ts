"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "participant"
  createdAt: string
  needsPasswordSetup?: boolean
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

// Função para gerar hash da senha
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Função para verificar senha
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Função para obter usuário atual dos cookies
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("auth-user")
  
  if (!userCookie) {
    return null
  }

  try {
    const user = JSON.parse(userCookie.value)
    return user
  } catch {
    return null
  }
}

// Função para login
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Primeiro, procurar por admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin) {
      const isValid = await verifyPassword(password, admin.password)
      if (isValid) {
        const user: AuthUser = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
          createdAt: admin.createdAt.toISOString()
        }

        // Salvar nos cookies
        const cookieStore = cookies()
        cookieStore.set("auth-user", JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60, // 30 dias
          path: "/"
        })

        return { success: true, user }
      }
    }

    // Se não encontrou admin, procurar por participante
    // Nota: Como no schema Prisma, participant não tem campo email único global,
    // precisamos buscar de forma diferente. Vamos buscar todos e filtrar.
    const participants = await prisma.participant.findMany({
      where: { email }
    })

    if (participants.length > 0) {
      // Pegar o primeiro participante (pode implementar lógica mais complexa depois)
      const participant = participants[0]
      // Para participantes, verificar se já tem senha definida
      const admin = await prisma.admin.findUnique({
        where: { id: participant.adminId }
      })

      if (!admin) {
        return { success: false, error: "Admin não encontrado para este participante" }
      }

      // Verificar se participante tem senha (podemos usar um campo adicional ou uma tabela separada)
      // Por enquanto, vamos usar uma abordagem simples onde participantes usam uma senha padrão
      // que depois podem alterar
      
      const user: AuthUser = {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        role: "participant",
        createdAt: participant.createdAt.toISOString(),
        needsPasswordSetup: true // Por agora, sempre true para participantes
      }

      // Salvar nos cookies
      const cookieStore = cookies()
      cookieStore.set("auth-user", JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/"
      })

      return { success: true, user }
    }

    return { success: false, error: "Email ou senha inválidos" }
  } catch (error) {
    console.error("Erro no login:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para logout
export async function logoutUser(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete("auth-user")
}

// Função para registrar admin
export async function registerAdmin(name: string, email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Verificar se já existe admin com este email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return { success: false, error: "Email já está em uso" }
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    const user: AuthUser = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      createdAt: admin.createdAt.toISOString()
    }

    return { success: true, user }
  } catch (error) {
    console.error("Erro no registro:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para alterar senha do usuário atual
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    if (user.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { id: user.id }
      })

      if (!admin) {
        return { success: false, error: "Admin não encontrado" }
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, admin.password)
      if (!isCurrentPasswordValid) {
        return { success: false, error: "Senha atual incorreta" }
      }

      const hashedNewPassword = await hashPassword(newPassword)

      await prisma.admin.update({
        where: { id: user.id },
        data: { password: hashedNewPassword }
      })

      return { success: true }
    }

    // Para participantes, implementar lógica similar se necessário
    return { success: false, error: "Alteração de senha para participantes não implementada ainda" }
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para obter estado de autenticação
export async function getAuthState(): Promise<AuthState> {
  const user = await getCurrentUser()
  return {
    user,
    isAuthenticated: !!user
  }
}

// Função para garantir que existe um admin padrão
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const adminCount = await prisma.admin.count()
    
    if (adminCount === 0) {
      const hashedPassword = await hashPassword("Nova!@#")
      
      await prisma.admin.create({
        data: {
          name: "Ricardo Aleixo",
          email: "ricardoaleixoo@gmail.com",
          password: hashedPassword
        }
      })
      
      console.log("Admin padrão criado: ricardoaleixoo@gmail.com")
    }
  } catch (error) {
    console.error("Erro ao criar admin padrão:", error)
  }
}

// Função para sincronizar participantes como usuários (similar ao auth.ts original)
export async function syncParticipantsAsUsers(): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return
    }

    // Esta função pode ser implementada se necessário
    // Por agora, os participantes são criados diretamente no banco
  } catch (error) {
    console.error("Erro ao sincronizar participantes:", error)
  }
}