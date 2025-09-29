"use client"

import { useState, useEffect } from "react"
import { getParticipants, getSales } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Target, CheckCircle, Clock, Star } from "lucide-react"

interface MissionData {
  id: string
  title: string
  description: string
  target: number
  current: number
  completed: boolean
  points: number
  difficulty: "easy" | "medium" | "hard"
}

interface MissionsGameProps {
  competition: Competition
  participant: Participant
}

export function MissionsGame({ competition, participant }: MissionsGameProps) {
  const [missions, setMissions] = useState<MissionData[]>([])
  const [completedMissions, setCompletedMissions] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [ranking, setRanking] = useState<Participant[]>([])
  const [position, setPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadMissionsData()
  }, [participant, competition])

  const loadMissionsData = async () => {
    setIsLoading(true)
    try {
      const allSales = await getSales()
      const sales = allSales.filter((s) => s.participantId === participant.id)
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.points * 10, 0) // Assuming points represent value

      // Get sales from current week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weekSales = sales.filter((s) => new Date(s.date) >= oneWeekAgo)
      const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.points * 10, 0)

      // High value sales (above 50 points)
      const highValueSales = sales.filter((s) => s.points >= 50)

      // Define weekly missions
      const weeklyMissions: MissionData[] = [
        {
          id: "week-sales-3",
          title: "Vendedor da Semana",
          description: "Realize 3 vendas nesta semana",
          target: 3,
          current: weekSales.length,
          completed: weekSales.length >= 3,
          points: 100,
          difficulty: "easy",
        },
        {
          id: "week-revenue-1000",
          title: "Meta de Faturamento",
          description: "Fature 100 pontos nesta semana",
          target: 100,
          current: weekRevenue / 10, // Convert back to points for display
          completed: weekRevenue >= 1000,
          points: 150,
          difficulty: "medium",
        },
        {
          id: "high-value-2",
          title: "Vendas Premium",
          description: "Realize 2 vendas acima de 50 pontos",
          target: 2,
          current: highValueSales.length,
          completed: highValueSales.length >= 2,
          points: 200,
          difficulty: "hard",
        },
        {
          id: "daily-streak",
          title: "Sequência Diária",
          description: "Venda por 3 dias consecutivos",
          target: 3,
          current: Math.min(3, Math.floor(sales.length / 2)), // Simplified calculation
          completed: sales.length >= 6, // Simplified: 2 sales per day for 3 days
          points: 120,
          difficulty: "medium",
        },
        {
          id: "total-sales-15",
          title: "Vendedor Expert",
          description: "Realize 15 vendas no total",
          target: 15,
          current: sales.length,
          completed: sales.length >= 15,
          points: 250,
          difficulty: "hard",
        },
      ]

      setMissions(weeklyMissions)

      const completed = weeklyMissions.filter((m) => m.completed).length
      setCompletedMissions(completed)

      const points = weeklyMissions.reduce((sum, mission) => sum + (mission.completed ? mission.points : 0), 0)
      setTotalPoints(points)

      // Calculate ranking based on completed missions and points
      const allParticipants = await getParticipants()
      const competitionParticipants = allParticipants.filter((p) => competition.participants.includes(p.id))

      const participantsWithMissionScores = competitionParticipants.map((p) => {
        const pSales = allSales.filter((s) => s.participantId === p.id)
        const pWeekSales = pSales.filter((s) => new Date(s.date) >= oneWeekAgo)
        const pWeekRevenue = pWeekSales.reduce((sum, sale) => sum + sale.points * 10, 0)
        const pHighValueSales = pSales.filter((s) => s.points >= 50)

        const pMissions = weeklyMissions.map((mission) => {
          switch (mission.id) {
            case "week-sales-3":
              return { ...mission, current: pWeekSales.length, completed: pWeekSales.length >= 3 }
            case "week-revenue-1000":
              return { ...mission, current: pWeekRevenue / 10, completed: pWeekRevenue >= 1000 }
            case "high-value-2":
              return { ...mission, current: pHighValueSales.length, completed: pHighValueSales.length >= 2 }
            case "daily-streak":
              return { ...mission, current: Math.min(3, Math.floor(pSales.length / 2)), completed: pSales.length >= 6 }
            case "total-sales-15":
              return { ...mission, current: pSales.length, completed: pSales.length >= 15 }
            default:
              return mission
          }
        })

        const completedCount = pMissions.filter((m) => m.completed).length
        const totalPoints = pMissions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0)

        return { ...p, completedMissions: completedCount, missionPoints: totalPoints }
      })

      const sorted = participantsWithMissionScores.sort((a: any, b: any) => {
        if (b.completedMissions !== a.completedMissions) {
          return b.completedMissions - a.completedMissions
        }
        return b.missionPoints - a.missionPoints
      })

      setRanking(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)
    } catch (error) {
      console.error("Erro ao carregar dados das missões:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: MissionData["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
    }
  }

  const getDifficultyLabel = (difficulty: MissionData["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "Fácil"
      case "medium":
        return "Médio"
      case "hard":
        return "Difícil"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <span>Missões Semanais</span>
        </CardTitle>
        <CardDescription>Complete desafios específicos para ganhar pontos extras</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mission Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{completedMissions}</p>
            <p className="text-xs text-muted-foreground">Missões Completas</p>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Pontos de Missão</p>
          </div>
        </div>

        {/* Position */}
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">#{position}</span>
          </div>
          <Badge variant={position <= 3 ? "default" : "secondary"}>
            {completedMissions === missions.length
              ? "Todas Completas!"
              : `${completedMissions}/${missions.length} Missões`}
          </Badge>
        </div>

        {/* Missions List */}
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Carregando missões...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((mission) => {
              const progress = Math.min((mission.current / mission.target) * 100, 100)

              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-lg border ${
                    mission.completed
                      ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-200"
                      : "bg-white/50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {mission.completed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h4 className={`font-semibold ${mission.completed ? "text-emerald-700" : ""}`}>
                          {mission.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                          {getDifficultyLabel(mission.difficulty)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          +{mission.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>
                        {Math.floor(mission.current)}/{mission.target}
                        {mission.id === "week-revenue-1000" && " pts"}
                      </span>
                    </div>
                    <Progress value={progress} className={mission.completed ? "progress-pulse" : ""} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sistema de Missões</span>
            <MapPin className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Complete missões para ganhar pontos extras. Missões são renovadas semanalmente!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
