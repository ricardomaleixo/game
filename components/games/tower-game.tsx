"use client"

import { useState, useEffect } from "react"
import { getParticipants } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building, Trophy } from "lucide-react"

interface TowerGameProps {
  competition: Competition
  participant: Participant
}

export function TowerGame({ competition, participant }: TowerGameProps) {
  const [allCompetitionParticipants, setAllCompetitionParticipants] = useState<Participant[]>([])
  const [towerHeight, setTowerHeight] = useState(0)
  const [ranking, setRanking] = useState<Participant[]>([])
  const [position, setPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTowerData()
  }, [participant, competition])

  const loadTowerData = async () => {
    setIsLoading(true)
    try {
      // Calculate tower height based on points (each 10 points = 1 floor)
      const height = Math.floor(participant.points / 10)
      setTowerHeight(height)

      // Get ranking for this competition
      const allParticipants = await getParticipants()
      const competitionParticipants = allParticipants.filter((p) => competition.participants.includes(p.id))
      const sorted = competitionParticipants.sort((a, b) => b.points - a.points)
      setRanking(sorted)
      setAllCompetitionParticipants(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)
    } catch (error) {
      console.error("Erro ao carregar dados da torre:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const maxHeight = ranking[0] ? Math.floor(ranking[0].points / 10) : 1

  const renderParticipantTower = (p: Participant, isCurrentUser: boolean) => {
    const height = Math.floor(p.points / 10)
    const progressPercentage = maxHeight > 0 ? (height / maxHeight) * 100 : 0
    const maxFloorsToShow = Math.min(height, 10)

    const floors = []
    for (let i = 0; i < maxFloorsToShow; i++) {
      floors.push(
        <div
          key={i}
          className={`h-4 sm:h-6 ${
            isCurrentUser ? "bg-gradient-to-r from-primary to-accent" : "bg-gradient-to-r from-gray-400 to-gray-500"
          } rounded-sm mb-1 tower-animation`}
          style={{
            animationDelay: `${i * 0.1}s`,
            width: `${90 + Math.random() * 20}%`,
          }}
        />,
      )
    }

    return (
      <div className="flex flex-col items-center space-y-2 min-w-[80px] sm:min-w-[100px]">
        <div className="text-center">
          <p className={`text-xs sm:text-sm font-semibold ${isCurrentUser ? "text-primary" : "text-muted-foreground"}`}>
            {p.name.split(" ")[0]}
            {isCurrentUser && " (Você)"}
          </p>
          <Badge variant={isCurrentUser ? "default" : "secondary"} className="text-xs mt-1">
            {height} andares
          </Badge>
        </div>
        <div className="bg-gradient-to-t from-green-100 to-green-50 rounded-lg p-2 min-h-[120px] sm:min-h-[150px] flex flex-col justify-end items-center w-full">
          {height === 0 ? (
            <div className="text-center text-muted-foreground">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Sem torre</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full max-w-[60px] sm:max-w-[80px]">
              {floors.reverse()}
              <div className="w-full h-2 sm:h-3 bg-gradient-to-r from-gray-600 to-gray-800 rounded-sm mt-1" />
            </div>
          )}
        </div>
        <Progress value={progressPercentage} className="h-1.5 sm:h-2 w-full" />
        <p className="text-xs text-muted-foreground">{p.points} pts</p>
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <span>Torre de Pontos</span>
        </CardTitle>
        <CardDescription>Cada venda adiciona um andar à torre - Compare com seus oponentes!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="relative">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-xs sm:text-sm">Carregando torres...</p>
            </div>
          ) : allCompetitionParticipants.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Building className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhum participante na competição</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-3 sm:space-x-4 min-w-max px-2">
                {allCompetitionParticipants.map((p) => (
                  <div key={p.id}>{renderParticipantTower(p, p.id === participant.id)}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium">Sua Posição</span>
            <div className="flex items-center space-x-2">
              <Badge variant={position <= 3 ? "default" : "secondary"} className="text-xs">
                #{position}
              </Badge>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Termine com a torre mais alta para ganhar! Cada 10 pontos = 1 andar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
