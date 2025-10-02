"use server"

import { getCurrentUser } from "./auth-actions"
import { prisma } from "@/lib/prisma"

async function getCurrentAdminId(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return null
  }
  return user.id
}

export async function getParticipants() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      return []
    }
    
    const participants = await prisma.participant.findMany({
      where: { adminId },
      orderBy: { points: "desc" },
    })
    
    return participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      position: p.position,
      points: p.points,
      createdAt: p.createdAt.toISOString(),
      adminId: p.adminId,
    }))
  } catch (error) {
    console.error("Error fetching participants:", error)
    return []
  }
}

export async function saveParticipant(participant: { name: string; email: string; position: string }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    // Verificar se já existe um participante com esse email para este admin
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        email: participant.email,
        adminId
      }
    })

    if (existingParticipant) {
      throw new Error(`Já existe um participante com o email ${participant.email}`)
    }

    const newParticipant = await prisma.participant.create({
      data: {
        name: participant.name,
        email: participant.email,
        position: participant.position,
        points: 0,
        adminId,
      },
    })

    return {
      id: newParticipant.id,
      name: newParticipant.name,
      email: newParticipant.email,
      position: newParticipant.position,
      points: newParticipant.points,
      createdAt: newParticipant.createdAt.toISOString(),
      adminId: newParticipant.adminId,
    }
  } catch (error) {
    console.error("Error saving participant:", error)
    
    // Verificar se é erro de constraint única
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      throw new Error(`Já existe um participante com o email ${participant.email}`)
    }
    
    throw error
  }
}

export async function updateParticipant(id: string, updates: { name?: string; email?: string; position?: string; points?: number }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    await prisma.participant.updateMany({
      where: { id, adminId },
      data: updates,
    })
  } catch (error) {
    console.error("Error updating participant:", error)
    throw error
  }
}

export async function deleteParticipant(id: string) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    // O Prisma vai deletar automaticamente vendas e conquistas relacionadas (CASCADE)
    await prisma.participant.deleteMany({
      where: { id, adminId },
    })
  } catch (error) {
    console.error("Error deleting participant:", error)
    throw error
  }
}

export async function getCompetitions() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const competitions = await prisma.competition.findMany({
      where: { adminId },
    })

    return competitions.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as "tower" | "race" | "treasure" | "medals" | "missions",
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      isActive: c.isActive,
      rules: c.rules as any,
      participants: c.participants as string[],
      adminId: c.adminId,
    }))
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return []
  }
}

export async function saveCompetition(competition: {
  name: string
  type: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate: string
  endDate: string,
  participants: string[]
}) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const newCompetition = await prisma.competition.create({
      data: {
        name: competition.name,
        type: competition.type,
        startDate: new Date(competition.startDate),
        endDate: new Date(competition.endDate),
        isActive: true,
        rules: {},
        participants: [],
        adminId,
      },
    })

    return {
      id: newCompetition.id,
      name: newCompetition.name,
      type: newCompetition.type as "tower" | "race" | "treasure" | "medals" | "missions",
      startDate: newCompetition.startDate.toISOString(),
      endDate: newCompetition.endDate.toISOString(),
      isActive: newCompetition.isActive,
      rules: newCompetition.rules as any,
      participants: newCompetition.participants as string[],
      adminId: newCompetition.adminId,
    }
  } catch (error) {
    console.error("Error saving competition:", error)
    throw error
  }
}

export async function updateCompetition(id: string, updates: {
  name?: string
  type?: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate?: string
  endDate?: string
  isActive?: boolean
  rules?: any
  participants?: string[]
}) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const updateData: any = { ...updates }
    if (updates.startDate) updateData.startDate = new Date(updates.startDate)
    if (updates.endDate) updateData.endDate = new Date(updates.endDate)

    await prisma.competition.updateMany({
      where: { id, adminId },
      data: updateData,
    })
  } catch (error) {
    console.error("Error updating competition:", error)
    throw error
  }
}

export async function deleteCompetition(id: string) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    await prisma.competition.deleteMany({
      where: { id, adminId },
    })
  } catch (error) {
    console.error("Error deleting competition:", error)
    throw error
  }
}

export async function getGameRules() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const rules = await prisma.gameRule.findMany({
      where: { adminId },
    })

    return rules.map((r) => ({
      id: r.id,
      productName: r.productName,
      points: r.points,
      isActive: r.isActive,
      adminId: r.adminId,
    }))
  } catch (error) {
    console.error("Error fetching game rules:", error)
    return []
  }
}

export async function saveGameRule(rule: { productName: string; points: number, isActive: boolean }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const newRule = await prisma.gameRule.create({
      data: {
        productName: rule.productName,
        points: rule.points,
        isActive: true,
        adminId,
      },
    })

    return {
      id: newRule.id,
      productName: newRule.productName,
      points: newRule.points,
      isActive: newRule.isActive,
      adminId: newRule.adminId,
    }
  } catch (error) {
    console.error("Error saving game rule:", error)
    throw error
  }
}

export async function updateGameRule(id: string, updates: { productName?: string; points?: number; isActive?: boolean }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    await prisma.gameRule.updateMany({
      where: { id, adminId },
      data: updates,
    })
  } catch (error) {
    console.error("Error updating game rule:", error)
    throw error
  }
}

export async function deleteGameRule(id: string) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    await prisma.gameRule.deleteMany({
      where: { id, adminId },
    })
  } catch (error) {
    console.error("Error deleting game rule:", error)
    throw error
  }
}

export async function getSales() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const sales = await prisma.sale.findMany({
      where: { adminId },
      orderBy: { date: "desc" },
    })

    return sales.map((s) => ({
      id: s.id,
      participantId: s.participantId,
      productName: s.productName,
      points: s.points,
      date: s.date.toISOString(),
      type: s.type as "sale" | "rental",
      adminId: s.adminId,
    }))
  } catch (error) {
    console.error("Error fetching sales:", error)
    return []
  }
}

export async function saveSale(sale: { participantId: string; productName: string; points: number; date: string; type: "sale" | "rental" }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar a venda
      const newSale = await tx.sale.create({
        data: {
          participantId: sale.participantId,
          productName: sale.productName,
          points: sale.points,
          date: new Date(sale.date),
          type: sale.type,
          adminId,
        },
      })

      // Atualizar pontos do participante
      await tx.participant.update({
        where: { id: sale.participantId },
        data: {
          points: {
            increment: sale.points,
          },
        },
      })

      return newSale
    })

    return {
      id: result.id,
      participantId: result.participantId,
      productName: result.productName,
      points: result.points,
      date: result.date.toISOString(),
      type: result.type as "sale" | "rental",
      adminId: result.adminId,
    }
  } catch (error) {
    console.error("Error saving sale:", error)
    throw error
  }
}

export async function updateSale(id: string, updates: { participantId?: string; productName?: string; points?: number; date?: string; type?: "sale" | "rental" }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    
    await prisma.$transaction(async (tx) => {
      // Buscar venda atual
      const currentSale = await tx.sale.findFirst({
        where: { id, adminId },
      })

      if (!currentSale) return

      // Calcular diferença de pontos
      const pointsDiff = (updates.points || currentSale.points) - currentSale.points

      // Atualizar venda
      await tx.sale.update({
        where: { id },
        data: {
          ...updates,
          date: updates.date ? new Date(updates.date) : undefined,
        },
      })

      // Ajustar pontos se necessário
      if (pointsDiff !== 0) {
        const targetParticipantId = updates.participantId || currentSale.participantId

        if (updates.participantId && updates.participantId !== currentSale.participantId) {
          // Remover pontos do participante anterior
          await tx.participant.update({
            where: { id: currentSale.participantId },
            data: { points: { decrement: currentSale.points } },
          })

          // Adicionar pontos ao novo participante
          await tx.participant.update({
            where: { id: updates.participantId },
            data: { points: { increment: updates.points || currentSale.points } },
          })
        } else {
          // Ajustar diferença de pontos
          await tx.participant.update({
            where: { id: targetParticipantId },
            data: { points: { increment: pointsDiff } },
          })
        }
      }
    })
  } catch (error) {
    console.error("Error updating sale:", error)
    throw error
  }
}

export async function deleteSale(id: string) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    
    await prisma.$transaction(async (tx) => {
      // Buscar venda para remover pontos
      const sale = await tx.sale.findFirst({
        where: { id, adminId },
      })

      if (!sale) return

      // Remover pontos do participante
      await tx.participant.update({
        where: { id: sale.participantId },
        data: { points: { decrement: sale.points } },
      })

      // Deletar venda
      await tx.sale.delete({
        where: { id },
      })
    })
  } catch (error) {
    console.error("Error deleting sale:", error)
    throw error
  }
}

export async function getAchievements() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const achievements = await prisma.achievement.findMany({
      where: { adminId },
    })

    return achievements.map((a) => ({
      id: a.id,
      participantId: a.participantId,
      competitionId: a.competitionId || "",
      type: a.type as "gold" | "silver" | "bronze" | "treasure" | "mission",
      description: a.description,
      points: a.points,
      date: a.date.toISOString(),
      adminId: a.adminId,
    }))
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return []
  }
}

export async function saveAchievement(achievement: {
  participantId: string
  competitionId?: string
  type: "gold" | "silver" | "bronze" | "treasure" | "mission"
  description: string
  points: number
  date?: string
}) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const newAchievement = await prisma.achievement.create({
      data: {
        participantId: achievement.participantId,
        competitionId: achievement.competitionId || null,
        type: achievement.type,
        description: achievement.description,
        points: achievement.points,
        date: new Date(achievement.date ?? new Date().toISOString()),
        adminId,
      },
    })

    return {
      id: newAchievement.id,
      participantId: newAchievement.participantId,
      competitionId: newAchievement.competitionId || "",
      type: newAchievement.type as "gold" | "silver" | "bronze" | "treasure" | "mission",
      description: newAchievement.description,
      points: newAchievement.points,
      date: newAchievement.date.toISOString(),
      adminId: newAchievement.adminId,
    }
  } catch (error) {
    console.error("Error saving achievement:", error)
    throw error
  }
}

// Utility functions
export async function resetCompetition() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    await prisma.$transaction(async (tx) => {
      // Reset pontos dos participantes
      await tx.participant.updateMany({
        where: { adminId },
        data: { points: 0 },
      })

      // Deletar conquistas
      await tx.achievement.deleteMany({
        where: { adminId },
      })

      // Deletar vendas
      await tx.sale.deleteMany({
        where: { adminId },
      })
    })
  } catch (error) {
    console.error("Error resetting competition:", error)
    throw error
  }
}

export async function fixNegativePoints() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    await prisma.participant.updateMany({
      where: {
        adminId,
        points: { lt: 0 },
      },
      data: { points: 0 },
    })
  } catch (error) {
    console.error("Error fixing negative points:", error)
    throw error
  }
}

export async function clearAllUserData() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }
    await prisma.$transaction(async (tx) => {
      await tx.achievement.deleteMany({ where: { adminId } })
      await tx.sale.deleteMany({ where: { adminId } })
      await tx.gameRule.deleteMany({ where: { adminId } })
      await tx.competition.deleteMany({ where: { adminId } })
      await tx.participant.deleteMany({ where: { adminId } })
    })
  } catch (error) {
    console.error("Error clearing all user data:", error)
    throw error
  }
}

export async function getRanking() {
  return await getParticipants()
}