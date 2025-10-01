"use server"

import { getCurrentUser } from "./auth-actions"

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
    
    const { prisma } = await import("@/lib/prisma")
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

    const { prisma } = await import("@/lib/prisma")
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
    throw error
  }
}

export async function getCompetitions() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const { prisma } = await import("@/lib/prisma")
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
  endDate: string
}) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const { prisma } = await import("@/lib/prisma")
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

export async function getGameRules() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const { prisma } = await import("@/lib/prisma")
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

export async function saveGameRule(rule: { productName: string; points: number }) {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) {
      throw new Error("Admin não autenticado")
    }

    const { prisma } = await import("@/lib/prisma")
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

export async function getSales() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const { prisma } = await import("@/lib/prisma")
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

export async function getAchievements() {
  try {
    const adminId = await getCurrentAdminId()
    if (!adminId) return []

    const { prisma } = await import("@/lib/prisma")
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

export async function getRanking() {
  return await getParticipants()
}