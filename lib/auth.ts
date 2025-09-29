export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "participant"
  createdAt: string
  needsPasswordSetup?: boolean
}

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

  login(email: string, password: string): User | null {
    const users = this.getUsers()
    const passwords = this.getPasswords()
    const user = users.find((u) => u.email === email)

    if (user) {
      const userPassword = passwords[user.id]

      // Se não tem senha definida, aceita qualquer senha e redireciona para definir
      if (!userPassword) {
        return { ...user, needsPasswordSetup: true } as User & { needsPasswordSetup: boolean }
      }

      // Verifica senha definida pelo usuário
      if (userPassword === password) {
        localStorage.setItem(this.storageKey, JSON.stringify(user))
        return user
      }
    }

    return null
  }

  logout(): void {
    localStorage.removeItem(this.storageKey)
  }

  register(name: string, email: string, role: "admin" | "participant"): User {
    const users = this.getUsers()
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("gamified-sales-users", JSON.stringify(users))

    return newUser
  }

  setPassword(userId: string, password: string): boolean {
    const passwords = this.getPasswords()
    passwords[userId] = password
    localStorage.setItem("gamified-sales-passwords", JSON.stringify(passwords))
    return true
  }

  needsPasswordSetup(email: string): boolean {
    const users = this.getUsers()
    const passwords = this.getPasswords()
    const user = users.find((u) => u.email === email)

    if (user) {
      return !passwords[user.id]
    }

    return false
  }

  findUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find((u) => u.email === email) || null
  }

  syncParticipantsAsUsers(): void {
    if (typeof window === "undefined") return

    const currentUser = this.getAuthState().user
    if (!currentUser || currentUser.role !== "admin") return

    const allParticipants = JSON.parse(localStorage.getItem("gamified-sales-participants") || "[]")
    // Filtrar apenas participantes do admin logado
    const participants = allParticipants.filter((p: any) => p.adminId === currentUser.id)
    const existingUsers = this.getUsers()

    participants.forEach((participant: any) => {
      // Verificar se já existe usuário para este participante
      const userExists = existingUsers.find((u) => u.email === participant.email)

      if (!userExists) {
        // Criar usuário para o participante
        this.register(participant.name, participant.email, "participant")
      }
    })
  }

  private getUsers(): User[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem("gamified-sales-users")
    if (!stored) {
      // Criar usuário admin padrão
      const defaultAdmin: User = {
        id: "1",
        name: "Administrador",
        email: "admin@empresa.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("gamified-sales-users", JSON.stringify([defaultAdmin]))
      return [defaultAdmin]
    }

    return JSON.parse(stored)
  }

  private getPasswords(): Record<string, string> {
    if (typeof window === "undefined") return {}

    const stored = localStorage.getItem("gamified-sales-passwords")
    if (!stored) {
      // Senha padrão para admin
      const defaultPasswords = { "1": "admin123" }
      localStorage.setItem("gamified-sales-passwords", JSON.stringify(defaultPasswords))
      return defaultPasswords
    }

    return JSON.parse(stored)
  }
}

export const authService = new AuthService()
