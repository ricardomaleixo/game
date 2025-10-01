import { prismaDb } from "./database-prisma"

// Exportar interfaces para compatibilidade
export interface Participant {
  id: string
  name: string
  email: string
  position: string
  points: number
  createdAt: string
  adminId: string
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

class DatabaseWrapper {
  // Participants
  getParticipants(): Promise<Participant[]> {
    return prismaDb.getParticipants()
  }

  saveParticipant(participant: Omit<Participant, "id" | "createdAt">): Promise<Participant> {
    return prismaDb.saveParticipant(participant)
  }

  updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
    return prismaDb.updateParticipant(id, updates)
  }

  deleteParticipant(id: string): Promise<void> {
    return prismaDb.deleteParticipant(id)
  }

  // Sales
  getSales(): Promise<Sale[]> {
    return prismaDb.getSales()
  }

  saveSale(sale: Omit<Sale, "id" | "adminId">): Promise<Sale> {
    return prismaDb.saveSale(sale)
  }

  updateSale(id: string, updates: Partial<Omit<Sale, "id">>): Promise<void> {
    return prismaDb.updateSale(id, updates)
  }

  deleteSale(id: string): Promise<void> {
    return prismaDb.deleteSale(id)
  }

  // Game Rules
  getGameRules(): Promise<GameRule[]> {
    return prismaDb.getGameRules()
  }

  saveGameRule(rule: Omit<GameRule, "id" | "adminId">): Promise<GameRule> {
    return prismaDb.saveGameRule(rule)
  }

  updateGameRule(id: string, updates: Partial<Omit<GameRule, "id">>): Promise<void> {
    return prismaDb.updateGameRule(id, updates)
  }

  deleteGameRule(id: string): Promise<void> {
    return prismaDb.deleteGameRule(id)
  }

  // Competitions
  getCompetitions(): Promise<Competition[]> {
    return prismaDb.getCompetitions()
  }

  saveCompetition(competition: Omit<Competition, "id" | "adminId">): Promise<Competition> {
    return prismaDb.saveCompetition(competition)
  }

  updateCompetition(id: string, updates: Partial<Omit<Competition, "id">>): Promise<void> {
    return prismaDb.updateCompetition(id, updates)
  }

  deleteCompetition(id: string): Promise<void> {
    return prismaDb.deleteCompetition(id)
  }

  // Achievements
  getAchievements(): Promise<Achievement[]> {
    return prismaDb.getAchievements()
  }

  saveAchievement(achievement: Omit<Achievement, "id" | "adminId">): Promise<Achievement> {
    return prismaDb.saveAchievement(achievement)
  }

  // Teams (implementação temporária para compatibilidade)
  async getTeams(): Promise<any[]> {
    // TODO: Implementar teams no Prisma se necessário
    return []
  }

  async saveTeam(team: any): Promise<any> {
    // TODO: Implementar teams no Prisma se necessário
    return team
  }

  async updateTeam(id: string, updates: any): Promise<void> {
    // TODO: Implementar teams no Prisma se necessário
  }

  async deleteTeam(id: string): Promise<void> {
    // TODO: Implementar teams no Prisma se necessário
  }

  // Utility methods
  getRanking(): Promise<Participant[]> {
    return prismaDb.getRanking()
  }

  resetCompetition(): Promise<void> {
    return prismaDb.resetCompetition()
  }

  fixNegativePoints(): Promise<void> {
    return prismaDb.fixNegativePoints()
  }

  clearAllUserData(): Promise<void> {
    return prismaDb.clearAllUserData()
  }

  // Métodos de compatibilidade
  migrateDataToMultiTenant(): void {
    // Método de compatibilidade - não necessário com Prisma
  }
}

export const db = new DatabaseWrapper()

export const database = db
