import { prisma } from "./prisma"
import type { Participant, Sale, GameRule, Competition, Achievement } from "./database"

export class PrismaDatabaseService {
  private getCurrentAdminId(): string {
    if (typeof window === "undefined") {
      // Para server-side, tentar obter do contexto ou usar admin padrão
      return this.getDefaultAdminId()
    }
    const stored = localStorage.getItem("gamified-sales-auth")
    if (!stored) return this.getDefaultAdminId()
    try {
      const user = JSON.parse(stored)
      return user.role === "admin" ? user.id : this.getDefaultAdminId()
    } catch {
      return this.getDefaultAdminId()
    }
  }

  private getDefaultAdminId(): string {
    // Retornar um ID padrão para desenvolvimento
    // Em produção, isso deve vir de um contexto de autenticação apropriado
    return "developer-admin-id"
  }

  private getParticipantAdminId(): string {
    if (typeof window === "undefined") return ""
    const stored = localStorage.getItem("gamified-sales-auth")
    if (!stored) return ""
    try {
      const user = JSON.parse(stored)
      if (user.role === "participant") {
        // Para participantes, precisamos buscar no banco
        return user.adminId || ""
      }
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
        return this.getParticipantAdminId()
      }
      return ""
    } catch {
      return ""
    }
  }

  // Participants
  async getParticipants(): Promise<Participant[]> {
    const adminId = this.getRelevantAdminId()
    if (!adminId) return []

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
  }

  async saveParticipant(participant: Omit<Participant, "id" | "createdAt">): Promise<Participant> {
    
    const newParticipant = await prisma.participant.create({
      data: {
        name: participant.name,
        email: participant.email,
        position: participant.position,
        points: 0,
        adminId: participant.adminId,
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
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.participant.updateMany({
      where: { id, adminId },
      data: updates,
    })
  }

  async deleteParticipant(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    // O Prisma vai deletar automaticamente as vendas e conquistas relacionadas (CASCADE)
    await prisma.participant.deleteMany({
      where: { id, adminId },
    })
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    const adminId = this.getRelevantAdminId()
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
  }

  async saveSale(sale: Omit<Sale, "id" | "adminId">): Promise<Sale> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

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
  }

  async updateSale(id: string, updates: Partial<Omit<Sale, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

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
  }

  async deleteSale(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

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
  }

  // Game Rules
  async getGameRules(): Promise<GameRule[]> {
    const adminId = this.getRelevantAdminId()
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
  }

  async saveGameRule(rule: Omit<GameRule, "id" | "adminId">): Promise<GameRule> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newRule = await prisma.gameRule.create({
      data: {
        productName: rule.productName,
        points: rule.points,
        isActive: rule.isActive,
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
  }

  async updateGameRule(id: string, updates: Partial<Omit<GameRule, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.gameRule.updateMany({
      where: { id, adminId },
      data: updates,
    })
  }

  async deleteGameRule(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.gameRule.deleteMany({
      where: { id, adminId },
    })
  }

  // Competitions
  async getCompetitions(): Promise<Competition[]> {
    const adminId = this.getRelevantAdminId()
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
  }

  async saveCompetition(competition: Omit<Competition, "id" | "adminId">): Promise<Competition> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newCompetition = await prisma.competition.create({
      data: {
        name: competition.name,
        type: competition.type,
        startDate: new Date(competition.startDate),
        endDate: new Date(competition.endDate),
        isActive: competition.isActive,
        rules: competition.rules,
        participants: competition.participants,
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
  }

  async updateCompetition(id: string, updates: Partial<Omit<Competition, "id">>): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    const updateData: any = { ...updates }
    if (updates.startDate) updateData.startDate = new Date(updates.startDate)
    if (updates.endDate) updateData.endDate = new Date(updates.endDate)

    await prisma.competition.updateMany({
      where: { id, adminId },
      data: updateData,
    })
  }

  async deleteCompetition(id: string): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.competition.deleteMany({
      where: { id, adminId },
    })
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const adminId = this.getRelevantAdminId()
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
  }

  async saveAchievement(achievement: Omit<Achievement, "id" | "adminId">): Promise<Achievement> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) throw new Error("Admin não autenticado")

    const newAchievement = await prisma.achievement.create({
      data: {
        participantId: achievement.participantId,
        competitionId: achievement.competitionId || null,
        type: achievement.type,
        description: achievement.description,
        points: achievement.points,
        date: new Date(achievement.date),
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
  }

  // Utility methods
  async getRanking(): Promise<Participant[]> {
    return this.getParticipants() // Já ordenado por pontos
  }

  async resetCompetition(): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

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
  }

  async fixNegativePoints(): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.participant.updateMany({
      where: {
        adminId,
        points: { lt: 0 },
      },
      data: { points: 0 },
    })
  }

  async clearAllUserData(): Promise<void> {
    const adminId = this.getCurrentAdminId()
    if (!adminId) return

    await prisma.$transaction(async (tx) => {
      // Deletar conquistas
      await tx.achievement.deleteMany({
        where: { adminId },
      })

      // Deletar vendas
      await tx.sale.deleteMany({
        where: { adminId },
      })

      // Deletar participantes
      await tx.participant.deleteMany({
        where: { adminId },
      })

      // Deletar competições
      await tx.competition.deleteMany({
        where: { adminId },
      })
    })
  }

  // Métodos de migração (não necessários com Prisma, mas mantidos para compatibilidade)
  migrateDataToMultiTenant(): void {
    // Não necessário com Prisma
  }
}

export const prismaDb = new PrismaDatabaseService()
