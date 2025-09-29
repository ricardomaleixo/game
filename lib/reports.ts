import { getParticipants, getSales, getCompetitions, getAchievements } from "@/app/actions/database-actions"
import type { Competition } from "./database"

export interface ReportData {
  period: string
  participants: ParticipantReport[]
  summary: ReportSummary
  competitions: CompetitionReport[]
}

export interface ParticipantReport {
  id: string
  name: string
  position: string
  totalSales: number
  totalRevenue: number
  totalPoints: number
  averageTicket: number
  rankingPosition: number
  achievements: number
}

export interface ReportSummary {
  totalParticipants: number
  totalSales: number
  totalRevenue: number
  averageTicketOverall: number
  topPerformer: string
  competitionsActive: number
}

export interface CompetitionReport {
  id: string
  name: string
  type: string
  winner: string
  winnerId: string
  winnerPoints: number
  participantsCount: number
  startDate: string
  endDate: string
  isCompleted: boolean
}

class ReportsService {
  async generateFullReport(startDate?: string, endDate?: string): Promise<ReportData> {
    const participants = await getParticipants()
    const sales = await getSales()
    const competitions = await getCompetitions()

    // Filter sales by date range if provided
    let filteredSales = sales
    if (startDate && endDate) {
      filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate)
      })
    }

    // Generate participant reports
    const participantReports: ParticipantReport[] = participants.map((participant) => {
      const participantSales = filteredSales.filter((sale) => sale.participantId === participant.id)
      const totalRevenue = participantSales.reduce((sum, sale) => sum + sale.points * 10, 0)
      const averageTicket = participantSales.length > 0 ? totalRevenue / participantSales.length : 0

      return {
        id: participant.id,
        name: participant.name,
        position: participant.position,
        totalSales: participantSales.length,
        totalRevenue,
        totalPoints: participant.points,
        averageTicket,
        rankingPosition: 0, // Will be set after sorting
        achievements: 0, // Will be set by countAchievements
      }
    })

    // Count achievements for each participant
    for (const report of participantReports) {
      report.achievements = await this.countAchievements(report.id)
    }

    // Sort by points and set ranking positions
    participantReports.sort((a, b) => b.totalPoints - a.totalPoints)
    participantReports.forEach((report, index) => {
      report.rankingPosition = index + 1
    })

    // Generate summary
    const summary: ReportSummary = {
      totalParticipants: participants.length,
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.points * 10, 0),
      averageTicketOverall:
        filteredSales.length > 0
          ? filteredSales.reduce((sum, sale) => sum + sale.points * 10, 0) / filteredSales.length
          : 0,
      topPerformer: participantReports[0]?.name || "Nenhum",
      competitionsActive: competitions.filter((c) => c.isActive).length,
    }

    // Generate competition reports
    const competitionReports: CompetitionReport[] = []
    for (const competition of competitions) {
      const winner = await this.determineWinner(competition)
      competitionReports.push({
        id: competition.id,
        name: competition.name,
        type: this.getCompetitionTypeName(competition.type),
        winner: winner.name,
        winnerId: winner.id,
        winnerPoints: winner.points,
        participantsCount: competition.participants.length,
        startDate: competition.startDate,
        endDate: competition.endDate,
        isCompleted: new Date() > new Date(competition.endDate),
      })
    }

    const period = startDate && endDate ? `${startDate} a ${endDate}` : "Período completo"

    return {
      period,
      participants: participantReports,
      summary,
      competitions: competitionReports,
    }
  }

  async determineWinner(competition: Competition): Promise<{ id: string; name: string; points: number }> {
    const participants = await getParticipants()
    const competitionParticipants = participants.filter((p) => competition.participants.includes(p.id))

    if (competitionParticipants.length === 0) {
      return { id: "", name: "Nenhum participante", points: 0 }
    }

    // Different winning criteria based on competition type
    switch (competition.type) {
      case "tower":
      case "race":
      case "medals":
        // Winner by highest points
        const pointsWinner = competitionParticipants.reduce((prev, current) =>
          prev.points > current.points ? prev : current,
        )
        return { id: pointsWinner.id, name: pointsWinner.name, points: pointsWinner.points }

      case "treasure":
        // Winner by most sales (treasures found)
        const sales = await getSales()
        const treasureWinner = competitionParticipants.reduce((prev, current) => {
          const prevSales = sales.filter((s) => s.participantId === prev.id).length
          const currentSales = sales.filter((s) => s.participantId === current.id).length
          return prevSales > currentSales ? prev : current
        })
        const treasureCount = sales.filter((s) => s.participantId === treasureWinner.id).length
        return { id: treasureWinner.id, name: treasureWinner.name, points: treasureCount }

      case "missions":
        // Winner by most completed missions (simplified by points)
        const missionsWinner = competitionParticipants.reduce((prev, current) =>
          prev.points > current.points ? prev : current,
        )
        return { id: missionsWinner.id, name: missionsWinner.name, points: missionsWinner.points }

      default:
        const defaultWinner = competitionParticipants[0]
        return { id: defaultWinner.id, name: defaultWinner.name, points: defaultWinner.points }
    }
  }

  private async countAchievements(participantId: string): Promise<number> {
    const achievements = await getAchievements()
    return achievements.filter((a) => a.participantId === participantId).length
  }

  private getCompetitionTypeName(type: Competition["type"]): string {
    const typeNames = {
      tower: "Torre de Pontos",
      race: "Corrida Virtual",
      treasure: "Caça ao Tesouro",
      medals: "Ranking de Medalhas",
      missions: "Missões Semanais",
    }
    return typeNames[type] || type
  }

  exportToCSV(reportData: ReportData): string {
    const headers = ["Posição", "Nome", "Função", "Vendas", "Faturamento", "Pontos", "Ticket Médio", "Conquistas"]

    const rows = reportData.participants.map((p) => [
      p.rankingPosition,
      p.name,
      p.position,
      p.totalSales,
      `R$ ${(p.totalRevenue || 0).toFixed(2)}`,
      p.totalPoints,
      `R$ ${(p.averageTicket || 0).toFixed(2)}`,
      p.achievements,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    return csvContent
  }

  exportCompetitionsToCSV(competitions: CompetitionReport[]): string {
    const headers = ["Gincana", "Tipo", "Vencedor", "Pontos", "Participantes", "Início", "Fim", "Status"]

    const rows = competitions.map((c) => [
      c.name,
      c.type,
      c.winner,
      c.winnerPoints,
      c.participantsCount,
      new Date(c.startDate).toLocaleDateString("pt-BR"),
      new Date(c.endDate).toLocaleDateString("pt-BR"),
      c.isCompleted ? "Finalizada" : "Ativa",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    return csvContent
  }
}

export const reportsService = new ReportsService()
