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

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)
    } catch (error) {
      console.error("Erro ao carregar dados da torre:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const maxHeight = ranking[0] ? Math.floor(ranking[0].points / 10) : 1
  const progressPercentage = maxHeight > 0 ? (towerHeight / maxHeight) * 100 : 0

  const renderTowerFloors = () => {
    const floors = []
    const maxFloorsToShow = Math.min(towerHeight, 10) // Show max 10 floors visually

    for (let i = 0; i < maxFloorsToShow; i++) {
      floors.push(
        <div
          key={i}
          className={`h-6 bg-gradient-to-r from-primary to-accent rounded-sm mb-1 tower-animation`}
          style={{
            animationDelay: `${i * 0.1}s`,
            width: `${90 + Math.random() * 20}%`, // Slight width variation for visual appeal
          }}
        />,
      )
    }

    return floors.reverse() // Stack from bottom to top
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <span>Torre de Pontos</span>
        </CardTitle>
        <CardDescription>Cada venda adiciona um andar à sua torre</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tower Visualization */}
        <div className="relative">
          <div className="bg-gradient-to-t from-green-100 to-green-50 rounded-lg p-4 min-h-[200px] flex flex-col justify-end items-center">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Carregando torre...</p>
              </div>
            ) : towerHeight === 0 ? (
              <div className="text-center text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sua torre aparecerá aqui</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-[120px]">
                {renderTowerFloors()}
                <div className="w-full h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-sm mt-1" />
                {/* Ground */}
              </div>
            )}
          </div>

          {/* Tower Stats */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-blue-600">{towerHeight}</p>
            <p className="text-xs text-muted-foreground">andares</p>
          </div>
        </div>

        {/* Progress and Position */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso</span>
            <Badge variant={position <= 3 ? "default" : "secondary"}>#{position}</Badge>
          </div>
          <Progress value={progressPercentage} className="progress-pulse" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{participant.points} pontos</span>
            <span>{ranking[0]?.points || 0} pontos (líder)</span>
          </div>
        </div>

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Meta da Semana</span>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Termine com a torre mais alta para ganhar! Cada 10 pontos = 1 andar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
