import { localDb } from "./database-local"

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
    return localDb.getParticipants()
  }

  saveParticipant(participant: Omit<Participant, "id" | "createdAt" | "adminId">): Promise<Participant> {
    return localDb.saveParticipant(participant)
  }

  updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
    return localDb.updateParticipant(id, updates)
  }

  deleteParticipant(id: string): Promise<void> {
    return localDb.deleteParticipant(id)
  }

  // Sales
  getSales(): Promise<Sale[]> {
    return localDb.getSales()
  }

  saveSale(sale: Omit<Sale, "id" | "adminId">): Promise<Sale> {
    return localDb.saveSale(sale)
  }

  updateSale(id: string, updates: Partial<Omit<Sale, "id">>): Promise<void> {
    return localDb.updateSale(id, updates)
  }

  deleteSale(id: string): Promise<void> {
    return localDb.deleteSale(id)
  }

  // Game Rules
  getGameRules(): Promise<GameRule[]> {
    return localDb.getGameRules()
  }

  saveGameRule(rule: Omit<GameRule, "id" | "adminId">): Promise<GameRule> {
    return localDb.saveGameRule(rule)
  }

  updateGameRule(id: string, updates: Partial<Omit<GameRule, "id">>): Promise<void> {
    return localDb.updateGameRule(id, updates)
  }

  deleteGameRule(id: string): Promise<void> {
    return localDb.deleteGameRule(id)
  }

  // Competitions
  getCompetitions(): Promise<Competition[]> {
    return localDb.getCompetitions()
  }

  saveCompetition(competition: Omit<Competition, "id" | "adminId">): Promise<Competition> {
    return localDb.saveCompetition(competition)
  }

  updateCompetition(id: string, updates: Partial<Omit<Competition, "id">>): Promise<void> {
    return localDb.updateCompetition(id, updates)
  }

  deleteCompetition(id: string): Promise<void> {
    return localDb.deleteCompetition(id)
  }

  // Achievements
  getAchievements(): Promise<Achievement[]> {
    return localDb.getAchievements()
  }

  saveAchievement(achievement: Omit<Achievement, "id" | "adminId">): Promise<Achievement> {
    return localDb.saveAchievement(achievement)
  }

  // Teams
  getTeams(): Promise<any[]> {
    return localDb.getTeams()
  }

  saveTeam(team: any): Promise<any> {
    return localDb.saveTeam(team)
  }

  updateTeam(id: string, updates: any): Promise<void> {
    return localDb.updateTeam(id, updates)
  }

  deleteTeam(id: string): Promise<void> {
    return localDb.deleteTeam(id)
  }

  // Utility methods
  getRanking(): Promise<Participant[]> {
    return localDb.getRanking()
  }

  resetCompetition(): Promise<void> {
    return localDb.resetCompetition()
  }

  fixNegativePoints(): Promise<void> {
    return localDb.fixNegativePoints()
  }

  clearAllUserData(): Promise<void> {
    return localDb.clearAllUserData()
  }

  // Métodos de compatibilidade (não fazem nada no localStorage)
  migrateDataToMultiTenant(): void {
    // Não necessário com localStorage
  }
}

export const db = new DatabaseWrapper()

export const database = db
