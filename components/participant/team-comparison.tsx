"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
import { getMyTeamRanking, getMyParticipantData } from "@/app/actions/database-actions"
import type { Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Trophy, TrendingUp, Star, Crown, Medal, Award } from "lucide-react"

export function TeamComparison() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const teamRanking = await getMyTeamRanking()
      setParticipants(teamRanking)

      const current = await getMyParticipantData()
      setCurrentParticipant(current)
    } catch (error) {
      console.error("Erro ao carregar dados da equipe:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getProgressColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500"
      case 2:
        return "bg-gray-400"
      case 3:
        return "bg-amber-600"
      default:
        return "bg-primary"
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando dados da equipe...</p>
      </div>
    )
  }

  if (!currentParticipant) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Participante não encontrado</p>
      </div>
    )
  }

  const maxPoints = participants[0]?.points || 1
  const currentPosition = participants.findIndex((p) => p.id === currentParticipant.id) + 1

  return (
    <div className="space-y-6">
      {/* My Position Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Minha Posição</span>
          </CardTitle>
          <CardDescription>Sua classificação atual na equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">
                  {currentParticipant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{currentParticipant.name}</p>
                <p className="text-sm text-muted-foreground">{currentParticipant.position}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                {getRankIcon(currentPosition)}
                <span className="text-2xl font-bold">#{currentPosition}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentParticipant.points} pontos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ranking da Equipe</span>
          </CardTitle>
          <CardDescription>Compare seu desempenho com seus colegas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participants.map((participant, index) => {
              const isCurrentUser = participant.id === currentParticipant.id
              const progressPercentage = (participant.points / maxPoints) * 100

              return (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index + 1)}
                        <span className="font-semibold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                          {participant.name}
                          {isCurrentUser && <span className="ml-2 text-xs">(Você)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{participant.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{participant.points}</p>
                      <p className="text-sm text-muted-foreground">pontos</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{(progressPercentage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(index + 1)}`}
                        style={{ width: `${progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Insights de Performance</span>
          </CardTitle>
          <CardDescription>Análise do seu desempenho em relação à equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-chart-1">
                {currentPosition <= 3 ? "🏆" : currentPosition <= 5 ? "📈" : "💪"}
              </p>
              <p className="font-medium mt-2">
                {currentPosition <= 3 ? "Top Performer!" : currentPosition <= 5 ? "Bom desempenho" : "Continue assim!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentPosition <= 3
                  ? "Você está entre os melhores"
                  : currentPosition <= 5
                    ? "Você está acima da média"
                    : "Há espaço para crescer"}
              </p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-chart-2">
                {participants.length > 1
                  ? Math.round(((participants.length - currentPosition) / (participants.length - 1)) * 100)
                  : 100}
                %
              </p>
              <p className="font-medium mt-2">Percentil</p>
              <p className="text-sm text-muted-foreground">Sua posição relativa</p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-chart-3">
                {participants[0] && currentParticipant.points > 0
                  ? Math.round((currentParticipant.points / participants[0].points) * 100)
                  : 0}
                %
              </p>
              <p className="font-medium mt-2">Do Líder</p>
              <p className="text-sm text-muted-foreground">Distância do 1º lugar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
