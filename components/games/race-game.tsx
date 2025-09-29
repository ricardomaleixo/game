"use client"

import { useState, useEffect } from "react"
import { getParticipants, getSales } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Flag, Trophy } from "lucide-react"

interface RaceGameProps {
  competition: Competition
  participant: Participant
}

export function RaceGame({ competition, participant }: RaceGameProps) {
  const [raceProgress, setRaceProgress] = useState(0)
  const [ranking, setRanking] = useState<Participant[]>([])
  const [position, setPosition] = useState(0)
  const [sales, setSales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRaceData()
  }, [participant, competition])

  const loadRaceData = async () => {
    setIsLoading(true)
    try {
      // Get ranking for this competition
      const allParticipants = await getParticipants()
      const competitionParticipants = allParticipants.filter((p) => competition.participants.includes(p.id))
      const sorted = competitionParticipants.sort((a, b) => b.points - a.points)
      setRanking(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)

      // Get sales data
      const allSales = await getSales()
      const participantSales = allSales.filter((s) => s.participantId === participant.id)
      setSales(participantSales)

      // Calculate race progress (each sale moves avatar forward)
      const maxSales = 20 // Race finish line at 20 sales
      const progress = Math.min((participantSales.length / maxSales) * 100, 100)
      setRaceProgress(progress)
    } catch (error) {
      console.error("Erro ao carregar dados da corrida:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFinished = sales.length >= 20

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span>Corrida Virtual</span>
        </CardTitle>
        <CardDescription>Cada venda faz seu avatar avançar na pista</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Race Track */}
        <div className="relative bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg p-4 min-h-[120px]">
          {/* Track Lines */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-white rounded-full opacity-50" />
            <div className="absolute w-full h-0.5 bg-gray-300 rounded-full" style={{ top: "45%" }} />
            <div className="absolute w-full h-0.5 bg-gray-300 rounded-full" style={{ top: "55%" }} />
          </div>

          {/* Start Line */}
          <div className="absolute left-4 top-2 bottom-2 w-1 bg-green-500 rounded-full" />
          <div className="absolute left-2 top-1 text-xs text-green-600 font-bold">START</div>

          {/* Finish Line */}
          <div className="absolute right-4 top-2 bottom-2 w-1 bg-red-500 rounded-full" />
          <div className="absolute right-2 top-1 text-xs text-red-600 font-bold">
            <Flag className="h-4 w-4" />
          </div>

          {/* Avatar */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ left: `${Math.max(8, Math.min(raceProgress * 0.85 + 8, 85))}%` }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">{participant.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          {/* Progress Markers */}
          {[25, 50, 75].map((marker) => (
            <div
              key={marker}
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400 opacity-30"
              style={{ left: `${marker * 0.85 + 8}%` }}
            />
          ))}
        </div>

        {/* Race Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso da Corrida</span>
            <Badge variant={isFinished ? "default" : position <= 3 ? "default" : "secondary"}>
              {isFinished ? "Finalizado!" : `#${position}`}
            </Badge>
          </div>
          <Progress value={raceProgress} className="progress-pulse" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{sales.length} vendas</span>
            <span>20 vendas (meta)</span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Posições da Corrida</span>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando posições...</p>
          ) : (
            <div className="space-y-1">
              {ranking.slice(0, 3).map((p, index) => {
                const pSales = sales.filter((s) => s.participantId === p.id).length
                const isCurrentUser = p.id === participant.id
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between text-xs ${
                      isCurrentUser ? "font-semibold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      #{index + 1} {p.name} {isCurrentUser && "(Você)"}
                    </span>
                    <span>{pSales} vendas</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
