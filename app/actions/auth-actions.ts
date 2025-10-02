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
  const sessionCookie = cookieStore.get("session")
  
  if (!sessionCookie) {
    return null
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Buscar dados atualizados do usuário no banco
    if (sessionData.role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id: sessionData.id },
      })
      
      if (!admin) return null
      
      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        createdAt: admin.createdAt.toISOString(),
      }
    } else if (sessionData.role === 'participant') {
      const participant = await prisma.participant.findUnique({
        where: { id: sessionData.id },
      })
      
      if (!participant) return null
      
      return {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        role: 'participant',
        createdAt: participant.createdAt.toISOString(),
      }
    }
    
    return null
  } catch {
    return null
  }
}

// Função para login
export async function loginUser(email: string, password: string) {
  try {
    // Verificar se é admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (admin) {
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (isValidPassword) {
        // Definir cookie de sessão
        cookies().set({
          name: 'session',
          value: JSON.stringify({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          }),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return {
          success: true,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: 'admin' as const,
            createdAt: admin.createdAt.toISOString(),
          },
        };
      }
    }

    // Verificar se é participante
    const participant = await prisma.participant.findFirst({
      where: { email },
      include: { admin: true }
    });

    if (participant) {
      // Se participante não tem senha, precisa definir uma
      if (!participant.password) {
        return {
          success: false,
          needsPasswordSetup: true,
          participantId: participant.id,
          message: 'Primeiro acesso - defina sua senha'
        };
      }

      const isValidPassword = await bcrypt.compare(password, participant.password);
      if (isValidPassword) {
        // Definir cookie de sessão
        cookies().set({
          name: 'session',
          value: JSON.stringify({
            id: participant.id,
            email: participant.email,
            name: participant.name,
            role: 'participant',
            adminId: participant.adminId
          }),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return {
          success: true,
          user: {
            id: participant.id,
            name: participant.name,
            email: participant.email,
            role: 'participant' as const,
            createdAt: participant.createdAt.toISOString(),
          },
        };
      }
    }

    return { success: false, message: 'Credenciais inválidas' };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, message: 'Erro interno do servidor' };
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

// Função para registrar participante
export async function registerParticipant(name: string, email: string, position: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Verificar se já existe participante com este email
    const existingParticipants = await prisma.participant.findMany({
      where: { email }
    })

    if (existingParticipants.length > 0) {
      return { success: false, error: `Email já está em uso por outro participante ${existingParticipants}` }
    }

    // Obter admin atual
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Apenas admins podem registrar participantes" }
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        position,
        points: 0,
        adminId: currentUser.id
      }
    })

    const user: AuthUser = {
      id: participant.id,
      name: participant.name,
      email: participant.email,
      role: "participant",
      createdAt: participant.createdAt.toISOString(),
      needsPasswordSetup: true
    }

    return { success: true, user }
  } catch (error) {
    console.error("Erro no registro de participante:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}



// Função para verificar se participante precisa configurar senha
export async function participantNeedsPasswordSetup(email: string): Promise<boolean> {
  try {
    // Verificar se existe participante com este email que não tem senha configurada
    const participants = await prisma.participant.findMany({
      where: { email }
    })
    
    // Se encontrou participante, verificar se tem senha no sistema
    // Por agora, vamos assumir que participantes sempre precisam configurar senha no primeiro login
    return participants.length > 0
  } catch (error) {
    console.error("Erro ao verificar necessidade de senha:", error)
    return false
  }
}

// Função para encontrar usuário por email (admin ou participante)
export async function findUserByEmail(email: string): Promise<{ success: boolean; user?: AuthUser; needsPasswordSetup?: boolean; error?: string }> {
  try {
    // Primeiro, procurar por admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin) {
      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
          createdAt: admin.createdAt.toISOString()
        },
        needsPasswordSetup: false
      }
    }

    // Se não encontrou admin, procurar por participante
    const participants = await prisma.participant.findMany({
      where: { email }
    })

    if (participants.length > 0) {
      const participant = participants[0]
      return {
        success: true,
        user: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          role: "participant",
          createdAt: participant.createdAt.toISOString()
        },
        needsPasswordSetup: !participant.password // Precisa configurar senha se não tem password
      }
    }

    return { success: false, error: "Email não encontrado" }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para configurar senha de participante
export async function setParticipantPassword(participantId: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.participant.update({
      where: { id: participantId },
      data: { password: hashedPassword }
    });
    
    return { success: true, message: "Senha definida com sucesso" };
  } catch (error) {
    console.error("Erro ao definir senha do participante:", error);
    return { success: false, message: "Erro ao definir senha auth actions" };
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