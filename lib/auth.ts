import { 
  loginUser, 
  getCurrentUser, 
  logoutUser, 
  registerAdmin, 
  registerParticipant, 
  changePassword, 
  setParticipantPassword,
  participantNeedsPasswordSetup,
  findUserByEmail as findUserByEmailAction
} from "@/app/actions/auth-actions"
import type { AuthUser } from "@/app/actions/auth-actions"

// Tipo de compatibilidade
export type User = AuthUser

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthService {
  async getAuthState(): Promise<AuthState> {
    try {
      const user = await getCurrentUser()
      return { 
        user, 
        isAuthenticated: !!user 
      }
    } catch (error) {
      console.error("Erro ao obter estado de autenticação:", error)
      return { user: null, isAuthenticated: false }
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const result = await loginUser(email, password)
      if (result.success && result.user) {
        // Converter AuthUser para User (compatibilidade)
        const user: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          createdAt: result.user.createdAt,
          ...(result.user.hasOwnProperty("needsPasswordSetup") && { needsPasswordSetup: (result.user as any).needsPasswordSetup })
        }

        return user
      }
      return null
    } catch (error) {
      console.error("Erro no login:", error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      // Usar server action para logout
      await logoutUser()
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  async register(name: string, email: string, role: "admin" | "participant"): Promise<User> {
    try {
      if (role === "admin") {
        const result = await registerAdmin(name, email, "admin123") // Senha padrão
        if (result.success && result.user) {
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            createdAt: result.user.createdAt
          }
        } else {
          throw new Error(result.error || "Erro ao registrar admin")
        }
      } else {
        // Para participantes, usar server action
        const result = await registerParticipant(name, email, "Vendedor") // Posição padrão
        if (result.success && result.user) {
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            createdAt: result.user.createdAt,
            needsPasswordSetup: result.user.needsPasswordSetup
          }
        } else {
          throw new Error(result.error || "Erro ao registrar participante")
        }
      }
    } catch (error) {
      console.error("Erro no registro:", error)
      throw error
    }
  }

  async setPassword(userId: string, password: string): Promise<boolean> {
    try {
      // Usar a função setParticipantPassword para participantes
      const result = await setParticipantPassword(userId, password)
      return result.success
    } catch (error) {
      console.error("Erro ao definir senha authTS:", error)
      return false
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await findUserByEmailAction(email)
      if (result.success && result.user) {
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          createdAt: result.user.createdAt,
          needsPasswordSetup: result.user.needsPasswordSetup
        }
      }
      return null
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  }

  // Configurar senha de participante
  async setParticipantPassword(participantId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await setParticipantPassword(participantId, password)
    } catch (error) {
      console.error("Erro ao definir senha do participante:", error)
      return { success: false, error: "Erro interno do servidor" }
    }
  }

  // Verificar se participante precisa configurar senha
  async needsPasswordSetup(email: string): Promise<boolean> {
    try {
      return await participantNeedsPasswordSetup(email)
    } catch (error) {
      console.error("Erro ao verificar necessidade de senha:", error)
      return false
    }
  }
}

export const authService = new AuthService()
