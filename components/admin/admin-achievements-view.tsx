"use client"

import { useState, useEffect } from "react"
import { getParticipants, getAchievements, getCompetitions } from "@/app/actions/database-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown, Star } from "lucide-react"

interface ParticipantAchievements {
  participantId: string
  participantName: string
  totalPoints: number
  goldMedals: number
  silverMedals: number
  bronzeMedals: number
  achievements: Array<{
    type: string
    description: string
    points: number
    date: string
    competitionName: string
  }>
}

export function AdminAchievementsView() {
  const [participantAchievements, setParticipantAchievements] = useState<ParticipantAchievements[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    setIsLoading(true)
    try {
      const participants = await getParticipants()
      const achievements = await getAchievements()
      const competitions = await getCompetitions()

      const participantAchievementsData: ParticipantAchievements[] = participants.map((participant) => {
        const participantAchs = achievements.filter((a) => a.participantId === participant.id)

        const goldMedals = participantAchs.filter((a) => a.type === "gold").length
        const silverMedals = participantAchs.filter((a) => a.type === "silver").length
        const bronzeMedals = participantAchs.filter((a) => a.type === "bronze").length

        const totalPoints = participantAchs.reduce((sum, a) => sum + a.points, 0)

        const achievementsWithCompetition = participantAchs.map((ach) => {
          const competition = competitions.find((c) => c.id === ach.competitionId)
          return {
            type: ach.type,
            description: ach.description,
            points: ach.points,
            date: ach.date,
            competitionName: competition?.name || "Gincana Desconhecida",
          }
        })

        return {
          participantId: participant.id,
          participantName: participant.name,
          totalPoints,
          goldMedals,
          silverMedals,
          bronzeMedals,
          achievements: achievementsWithCompetition,
        }
      })

      // Ordenar por total de pontos (maior primeiro)
      participantAchievementsData.sort((a, b) => b.totalPoints - a.totalPoints)

      setParticipantAchievements(participantAchievementsData)
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMedalIcon = (type: string) => {
    switch (type) {
      case "gold":
        return <Crown className="h-5 w-5 text-yellow-500" />
      case "silver":
        return <Medal className="h-5 w-5 text-gray-400" />
      case "bronze":
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Histórico de Conquistas</span>
          </CardTitle>
          <CardDescription>Desempenho geral dos participantes em todas as gincanas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando conquistas...</p>
            </div>
          ) : participantAchievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conquista registrada ainda</p>
              <p className="text-sm text-muted-foreground">Declare vencedores para registrar conquistas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participantAchievements.map((participant, index) => (
                <Card key={participant.participantId} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                        <div>
                          <CardTitle className="text-lg">{participant.participantName}</CardTitle>
                          <CardDescription>{participant.totalPoints} pontos totais</CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {participant.goldMedals > 0 && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            <Crown className="h-3 w-3 mr-1" />
                            {participant.goldMedals}
                          </Badge>
                        )}
                        {participant.silverMedals > 0 && (
                          <Badge className="bg-gray-400 hover:bg-gray-500">
                            <Medal className="h-3 w-3 mr-1" />
                            {participant.silverMedals}
                          </Badge>
                        )}
                        {participant.bronzeMedals > 0 && (
                          <Badge className="bg-amber-600 hover:bg-amber-700">
                            <Award className="h-3 w-3 mr-1" />
                            {participant.bronzeMedals}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {participant.achievements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma conquista ainda</p>
                    ) : (
                      <div className="space-y-2">
                        {participant.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getMedalIcon(achievement.type)}
                              <div>
                                <p className="font-medium text-sm">{achievement.description}</p>
                                <p className="text-xs text-muted-foreground">{achievement.competitionName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{achievement.points} pts</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(achievement.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
