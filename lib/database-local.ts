// Local storage database service for gamified sales system
export interface Participant {
  id: string
  name: string
  email: string
  position: string
  points: number
  createdAt: string
  adminId: string
  teamId?: string
}

export interface Sale {
  id: string
  participantId: string
  productName: string
  points: number
  date: string
  type: "sale" | "rental"
  adminId: string
}

export interface GameRule {
  id: string
  productName: string
  points: number
  isActive: boolean
  adminId: string
}

export interface Competition {
  id: string
  name: string
  type: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate: string
  endDate: string
  isActive: boolean
  rules: any
  participants: string[]
  adminId: string
}

export interface Achievement {
  id: string
  participantId: string
  competitionId: string
  type: "gold" | "silver" | "bronze" | "treasure" | "mission"
  description: string
  points: number
  date: string
  adminId: string
}

export interface Team {
  id: string
  name: string
  color: string
  adminId: string
  memberIds: string[]
}

class LocalDatabaseService {
  private getCurrentAdminId(): string {
    if (typeof window === "undefined") return ""
    const stored = localStorage.getItem("gamified-sales-auth")
    if (!stored) return ""
    try {
      const user = JSON.parse(stored)
      return user.role === "admin" ? user.id : ""
    } catch {
      return ""
    }
  }

  private getRelevantAdminId(): string {
    if (typeof window === "undefined") return ""
    const stored = localStorage.getItem("gamified-sales-auth")
    if (!stored) return ""
    try {
      const user = JSON.parse(stored)
      if (user.role === "admin") {
        return user.id
      } else if (user.role === "participant") {
        // For participants, find their admin through participants data
        const participants = this.getAllParticipants()
        const participant = participants.find((p) => p.email === user.email)
        return participant?.adminId || ""
      }
      return ""
    } catch {
      return ""
    }
  }

  private getAllParticipants(): Participant[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("gamified-sales-participants")
    return stored ? JSON.parse(stored) : []
  }

  private saveAllParticipants(participants: Participant[]): void {
    localStorage.setItem("gamified-sales-participants", JSON.stringify(participants))
  }

  // Participants
  async getParticipants(): Promise<Participant[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const allParticipants = this.getAllParticipants()
    return allParticipants.filter((p) => p.adminId === adminId).sort((a, b) => b.points - a.points)
  }

  async saveParticipant(participant: Omit<Participant, "id" | "createdAt" | "adminId">): Promise<Participant> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newParticipant: Participant = {
      id: Date.now().toString(),
      ...participant,
      points: 0,
      createdAt: new Date().toISOString(),
      adminId,
    }

    const allParticipants = this.getAllParticipants()
    allParticipants.push(newParticipant)
    this.saveAllParticipants(allParticipants)

    return newParticipant
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const allParticipants = this.getAllParticipants()
    const index = allParticipants.findIndex((p) => p.id === id && p.adminId === adminId)

    if (index !== -1) {
      allParticipants[index] = { ...allParticipants[index], ...updates }
      this.saveAllParticipants(allParticipants)
    }
  }

  async deleteParticipant(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const allParticipants = this.getAllParticipants()
    const filtered = allParticipants.filter((p) => !(p.id === id && p.adminId === adminId))
    this.saveAllParticipants(filtered)

    // Also delete related sales and achievements
    await this.deleteSalesByParticipant(id)
    await this.deleteAchievementsByParticipant(id)
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const stored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = stored ? JSON.parse(stored) : []

    return allSales
      .filter((s) => s.adminId === adminId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async saveSale(sale: Omit<Sale, "id" | "adminId">): Promise<Sale> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newSale: Sale = {
      id: Date.now().toString(),
      ...sale,
      adminId,
    }

    // Save sale
    const stored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = stored ? JSON.parse(stored) : []
    allSales.push(newSale)
    localStorage.setItem("gamified-sales-sales", JSON.stringify(allSales))

    // Update participant points
    const allParticipants = this.getAllParticipants()
    const participantIndex = allParticipants.findIndex((p) => p.id === sale.participantId)
    if (participantIndex !== -1) {
      allParticipants[participantIndex].points += sale.points
      this.saveAllParticipants(allParticipants)
    }

    return newSale
  }

  async updateSale(id: string, updates: Partial<Omit<Sale, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = stored ? JSON.parse(stored) : []
    const saleIndex = allSales.findIndex((s) => s.id === id && s.adminId === adminId)

    if (saleIndex !== -1) {
      const oldSale = allSales[saleIndex]
      const updatedSale = { ...oldSale, ...updates }
      allSales[saleIndex] = updatedSale
      localStorage.setItem("gamified-sales-sales", JSON.stringify(allSales))

      // Update participant points if needed
      const pointsDiff = (updates.points || oldSale.points) - oldSale.points
      if (pointsDiff !== 0 || updates.participantId !== oldSale.participantId) {
        const allParticipants = this.getAllParticipants()

        if (updates.participantId && updates.participantId !== oldSale.participantId) {
          // Remove points from old participant
          const oldParticipantIndex = allParticipants.findIndex((p) => p.id === oldSale.participantId)
          if (oldParticipantIndex !== -1) {
            allParticipants[oldParticipantIndex].points -= oldSale.points
          }

          // Add points to new participant
          const newParticipantIndex = allParticipants.findIndex((p) => p.id === updates.participantId)
          if (newParticipantIndex !== -1) {
            allParticipants[newParticipantIndex].points += updates.points || oldSale.points
          }
        } else {
          // Just adjust points difference
          const participantIndex = allParticipants.findIndex((p) => p.id === oldSale.participantId)
          if (participantIndex !== -1) {
            allParticipants[participantIndex].points += pointsDiff
          }
        }

        this.saveAllParticipants(allParticipants)
      }
    }
  }

  async deleteSale(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = stored ? JSON.parse(stored) : []
    const saleIndex = allSales.findIndex((s) => s.id === id && s.adminId === adminId)

    if (saleIndex !== -1) {
      const sale = allSales[saleIndex]

      // Remove points from participant
      const allParticipants = this.getAllParticipants()
      const participantIndex = allParticipants.findIndex((p) => p.id === sale.participantId)
      if (participantIndex !== -1) {
        allParticipants[participantIndex].points -= sale.points
        this.saveAllParticipants(allParticipants)
      }

      // Remove sale
      allSales.splice(saleIndex, 1)
      localStorage.setItem("gamified-sales-sales", JSON.stringify(allSales))
    }
  }

  private async deleteSalesByParticipant(participantId: string): Promise<void> {
    const stored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = stored ? JSON.parse(stored) : []
    const filtered = allSales.filter((s) => s.participantId !== participantId)
    localStorage.setItem("gamified-sales-sales", JSON.stringify(filtered))
  }

  // Game Rules
  async getGameRules(): Promise<GameRule[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const stored = localStorage.getItem("gamified-sales-rules")
    const allRules: GameRule[] = stored ? JSON.parse(stored) : []

    return allRules.filter((r) => r.adminId === adminId)
  }

  async saveGameRule(rule: Omit<GameRule, "id" | "adminId">): Promise<GameRule> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newRule: GameRule = {
      id: Date.now().toString(),
      ...rule,
      adminId,
    }

    const stored = localStorage.getItem("gamified-sales-rules")
    const allRules: GameRule[] = stored ? JSON.parse(stored) : []
    allRules.push(newRule)
    localStorage.setItem("gamified-sales-rules", JSON.stringify(allRules))

    return newRule
  }

  async updateGameRule(id: string, updates: Partial<Omit<GameRule, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-rules")
    const allRules: GameRule[] = stored ? JSON.parse(stored) : []
    const index = allRules.findIndex((r) => r.id === id && r.adminId === adminId)

    if (index !== -1) {
      allRules[index] = { ...allRules[index], ...updates }
      localStorage.setItem("gamified-sales-rules", JSON.stringify(allRules))
    }
  }

  async deleteGameRule(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-rules")
    const allRules: GameRule[] = stored ? JSON.parse(stored) : []
    const filtered = allRules.filter((r) => !(r.id === id && r.adminId === adminId))
    localStorage.setItem("gamified-sales-rules", JSON.stringify(filtered))
  }

  // Competitions
  async getCompetitions(): Promise<Competition[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const stored = localStorage.getItem("gamified-sales-competitions")
    const allCompetitions: Competition[] = stored ? JSON.parse(stored) : []

    return allCompetitions.filter((c) => c.adminId === adminId)
  }

  async saveCompetition(competition: Omit<Competition, "id" | "adminId">): Promise<Competition> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newCompetition: Competition = {
      id: Date.now().toString(),
      ...competition,
      adminId,
    }

    const stored = localStorage.getItem("gamified-sales-competitions")
    const allCompetitions: Competition[] = stored ? JSON.parse(stored) : []
    allCompetitions.push(newCompetition)
    localStorage.setItem("gamified-sales-competitions", JSON.stringify(allCompetitions))

    return newCompetition
  }

  async updateCompetition(id: string, updates: Partial<Omit<Competition, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-competitions")
    const allCompetitions: Competition[] = stored ? JSON.parse(stored) : []
    const index = allCompetitions.findIndex((c) => c.id === id && c.adminId === adminId)

    if (index !== -1) {
      allCompetitions[index] = { ...allCompetitions[index], ...updates }
      localStorage.setItem("gamified-sales-competitions", JSON.stringify(allCompetitions))
    }
  }

  async deleteCompetition(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-competitions")
    const allCompetitions: Competition[] = stored ? JSON.parse(stored) : []
    const filtered = allCompetitions.filter((c) => !(c.id === id && c.adminId === adminId))
    localStorage.setItem("gamified-sales-competitions", JSON.stringify(filtered))
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const stored = localStorage.getItem("gamified-sales-achievements")
    const allAchievements: Achievement[] = stored ? JSON.parse(stored) : []

    return allAchievements.filter((a) => a.adminId === adminId)
  }

  async saveAchievement(achievement: Omit<Achievement, "id" | "adminId">): Promise<Achievement> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newAchievement: Achievement = {
      id: Date.now().toString(),
      ...achievement,
      adminId,
    }

    const stored = localStorage.getItem("gamified-sales-achievements")
    const allAchievements: Achievement[] = stored ? JSON.parse(stored) : []
    allAchievements.push(newAchievement)
    localStorage.setItem("gamified-sales-achievements", JSON.stringify(allAchievements))

    return newAchievement
  }

  private async deleteAchievementsByParticipant(participantId: string): Promise<void> {
    const stored = localStorage.getItem("gamified-sales-achievements")
    const allAchievements: Achievement[] = stored ? JSON.parse(stored) : []
    const filtered = allAchievements.filter((a) => a.participantId !== participantId)
    localStorage.setItem("gamified-sales-achievements", JSON.stringify(filtered))
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

    const stored = localStorage.getItem("gamified-sales-teams")
    const allTeams: Team[] = stored ? JSON.parse(stored) : []

    return allTeams.filter((t) => t.adminId === adminId)
  }

  async saveTeam(team: Omit<Team, "id" | "adminId">): Promise<Team> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newTeam: Team = {
      id: Date.now().toString(),
      ...team,
      adminId,
    }

    const stored = localStorage.getItem("gamified-sales-teams")
    const allTeams: Team[] = stored ? JSON.parse(stored) : []
    allTeams.push(newTeam)
    localStorage.setItem("gamified-sales-teams", JSON.stringify(allTeams))

    return newTeam
  }

  async updateTeam(id: string, updates: Partial<Omit<Team, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-teams")
    const allTeams: Team[] = stored ? JSON.parse(stored) : []
    const index = allTeams.findIndex((t) => t.id === id && t.adminId === adminId)

    if (index !== -1) {
      allTeams[index] = { ...allTeams[index], ...updates }
      localStorage.setItem("gamified-sales-teams", JSON.stringify(allTeams))
    }
  }

  async deleteTeam(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const stored = localStorage.getItem("gamified-sales-teams")
    const allTeams: Team[] = stored ? JSON.parse(stored) : []
    const filtered = allTeams.filter((t) => !(t.id === id && t.adminId === adminId))
    localStorage.setItem("gamified-sales-teams", JSON.stringify(filtered))

    // Remove team assignment from participants
    const allParticipants = this.getAllParticipants()
    const updatedParticipants = allParticipants.map((p) => (p.teamId === id ? { ...p, teamId: undefined } : p))
    this.saveAllParticipants(updatedParticipants)
  }

  // Utility methods
  async getRanking(): Promise<Participant[]> {
    return this.getParticipants() // Already sorted by points
  }

  async resetCompetition(): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    // Reset participant points
    const allParticipants = this.getAllParticipants()
    const updatedParticipants = allParticipants.map((p) => (p.adminId === adminId ? { ...p, points: 0 } : p))
    this.saveAllParticipants(updatedParticipants)

    // Clear achievements
    const stored = localStorage.getItem("gamified-sales-achievements")
    const allAchievements: Achievement[] = stored ? JSON.parse(stored) : []
    const filteredAchievements = allAchievements.filter((a) => a.adminId !== adminId)
    localStorage.setItem("gamified-sales-achievements", JSON.stringify(filteredAchievements))

    // Clear sales
    const salesStored = localStorage.getItem("gamified-sales-sales")
    const allSales: Sale[] = salesStored ? JSON.parse(salesStored) : []
    const filteredSales = allSales.filter((s) => s.adminId !== adminId)
    localStorage.setItem("gamified-sales-sales", JSON.stringify(filteredSales))
  }

  async fixNegativePoints(): Promise<void> {
    const allParticipants = this.getAllParticipants()
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const updatedParticipants = allParticipants.map((p) =>
      p.adminId === adminId && p.points < 0 ? { ...p, points: 0 } : p,
    )
    this.saveAllParticipants(updatedParticipants)
  }

  async clearAllUserData(): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    // Clear all data for this admin
    const keys = [
      "gamified-sales-participants",
      "gamified-sales-sales",
      "gamified-sales-achievements",
      "gamified-sales-competitions",
      "gamified-sales-teams",
    ]

    keys.forEach((key) => {
      const stored = localStorage.getItem(key)
      if (stored) {
        const allData = JSON.parse(stored)
        const filtered = allData.filter((item: any) => item.adminId !== adminId)
        localStorage.setItem(key, JSON.stringify(filtered))
      }
    })
  }
}

export const localDb = new LocalDatabaseService()
