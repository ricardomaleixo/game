"use server"

import { prismaDb } from "@/lib/database-prisma"

export async function getParticipants() {
  try {
    return await prismaDb.getParticipants()
  } catch (error) {
    console.error("Error fetching participants:", error)
    return []
  }
}

export async function getSales() {
  try {
    return await prismaDb.getSales()
  } catch (error) {
    console.error("Error fetching sales:", error)
    return []
  }
}

export async function getCompetitions() {
  try {
    return await prismaDb.getCompetitions()
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return []
  }
}

export async function getAchievements() {
  try {
    return await prismaDb.getAchievements()
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return []
  }
}

export async function getGameRules() {
  try {
    return await prismaDb.getGameRules()
  } catch (error) {
    console.error("Error fetching game rules:", error)
    return []
  }
}

export async function getRanking() {
  try {
    return await prismaDb.getRanking()
  } catch (error) {
    console.error("Error fetching ranking:", error)
    return []
  }
}

// Save operations
export async function saveParticipant(participant: any) {
  try {
    return await prismaDb.saveParticipant(participant)
  } catch (error) {
    console.error("Error saving participant:", error)
    throw error
  }
}

export async function saveSale(sale: any) {
  try {
    return await prismaDb.saveSale(sale)
  } catch (error) {
    console.error("Error saving sale:", error)
    throw error
  }
}

export async function saveCompetition(competition: any) {
  try {
    return await prismaDb.saveCompetition(competition)
  } catch (error) {
    console.error("Error saving competition:", error)
    throw error
  }
}

export async function saveGameRule(rule: any) {
  try {
    return await prismaDb.saveGameRule(rule)
  } catch (error) {
    console.error("Error saving game rule:", error)
    throw error
  }
}

export async function saveAchievement(achievement: any) {
  try {
    return await prismaDb.saveAchievement(achievement)
  } catch (error) {
    console.error("Error saving achievement:", error)
    throw error
  }
}

// Update operations
export async function updateParticipant(id: string, updates: any) {
  try {
    return await prismaDb.updateParticipant(id, updates)
  } catch (error) {
    console.error("Error updating participant:", error)
    throw error
  }
}

export async function updateSale(id: string, updates: any) {
  try {
    return await prismaDb.updateSale(id, updates)
  } catch (error) {
    console.error("Error updating sale:", error)
    throw error
  }
}

export async function updateCompetition(id: string, updates: any) {
  try {
    return await prismaDb.updateCompetition(id, updates)
  } catch (error) {
    console.error("Error updating competition:", error)
    throw error
  }
}

export async function updateGameRule(id: string, updates: any) {
  try {
    return await prismaDb.updateGameRule(id, updates)
  } catch (error) {
    console.error("Error updating game rule:", error)
    throw error
  }
}

// Delete operations
export async function deleteParticipant(id: string) {
  try {
    return await prismaDb.deleteParticipant(id)
  } catch (error) {
    console.error("Error deleting participant:", error)
    throw error
  }
}

export async function deleteSale(id: string) {
  try {
    return await prismaDb.deleteSale(id)
  } catch (error) {
    console.error("Error deleting sale:", error)
    throw error
  }
}

export async function deleteCompetition(id: string) {
  try {
    return await prismaDb.deleteCompetition(id)
  } catch (error) {
    console.error("Error deleting competition:", error)
    throw error
  }
}

export async function deleteGameRule(id: string) {
  try {
    return await prismaDb.deleteGameRule(id)
  } catch (error) {
    console.error("Error deleting game rule:", error)
    throw error
  }
}

// Utility operations
export async function resetCompetition() {
  try {
    return await prismaDb.resetCompetition()
  } catch (error) {
    console.error("Error resetting competition:", error)
    throw error
  }
}

export async function fixNegativePoints() {
  try {
    return await prismaDb.fixNegativePoints()
  } catch (error) {
    console.error("Error fixing negative points:", error)
    throw error
  }
}

export async function clearAllUserData() {
  try {
    return await prismaDb.clearAllUserData()
  } catch (error) {
    console.error("Error clearing all user data:", error)
    throw error
  }
}
