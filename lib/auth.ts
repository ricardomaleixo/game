import { loginUser, getCurrentUser, logoutUser, registerAdmin, changePassword, getAuthState } from "@/app/actions/auth-actions"
import type { AuthUser } from "@/app/actions/auth-actions"

// Tipo de compatibilidade
export type User = AuthUser

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthService {
  private storageKey = "gamified-sales-auth"

  getAuthState(): AuthState {
    if (typeof window === "undefined") {
      return { user: null, isAuthenticated: false }
    }

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) {
      return { user: null, isAuthenticated: false }
    }

    try {
      const user = JSON.parse(stored)
      return { user, isAuthenticated: true }
    } catch {
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
          needsPasswordSetup: result.user.needsPasswordSetup
        }

        // Salvar no localStorage para compatibilidade com código cliente existente
        if (typeof window !== "undefined") {
          localStorage.setItem(this.storageKey, JSON.stringify(user))
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
      
      // Também limpar localStorage para compatibilidade
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.storageKey)
      }
    } catch (error) {
      console.error("Erro no logout:", error)
      // Mesmo com erro, limpar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.storageKey)
      }
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
        // Para participantes, precisamos implementar na server action
        // Por enquanto, vamos manter a lógica atual
        throw new Error("Registro de participantes deve ser feito através de outras funções")
      }
    } catch (error) {
      console.error("Erro no registro:", error)
      throw error
    }
  }

  async setPassword(userId: string, password: string): Promise<boolean> {
    try {
      // Esta função deveria usar uma server action também
      // Por agora, retornar false indicando que não está implementada
      console.warn("setPassword deveria ser implementado via server action")
      return false
    } catch (error) {
      console.error("Erro ao definir senha:", error)
      return false
    }
  }

  async needsPasswordSetup(email: string): Promise<boolean> {
    try {
      // Esta função deveria usar uma server action também
      // Por agora, implementação simplificada
      console.warn("needsPasswordSetup deveria ser implementado via server action")
      return false
    } catch (error) {
      console.error("Erro ao verificar necessidade de senha:", error)
      return false
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      // Esta função deveria usar uma server action também
      // Por agora, implementação simplificada
      console.warn("findUserByEmail deveria ser implementado via server action")
      return null
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  }

  async syncParticipantsAsUsers(): Promise<void> {
    try {
      // Esta função deveria usar uma server action também
      console.warn("syncParticipantsAsUsers deveria ser implementado via server action")
    } catch (error) {
      console.error("Erro ao sincronizar participantes:", error)
    }
  }

  // Métodos privados para compatibilidade (não mais necessários)
  private async getUsers(): Promise<User[]> {
    // Esta função deveria usar uma server action
    console.warn("getUsers deveria ser implementado via server action")
    return []
  }

  private getPasswords(): Record<string, string> {
    // Não mais necessário com Prisma
    return {}
  }
}

export const authService = new AuthService()
