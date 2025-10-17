"use client"

import { useState, useEffect } from "react"
import { getMyTeamParticipants, getSales } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Flag, Trophy } from "lucide-react"

interface RaceGameProps {
  competition: Competition
  participant: Participant
}

interface ParticipantRaceData {
  participant: Participant
  salesCount: number
  progress: number
}

export function RaceGame({ competition, participant }: RaceGameProps) {
  const [allRaceData, setAllRaceData] = useState<ParticipantRaceData[]>([])
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
      console.log("[v0] RaceGame - Competition:", competition)
      console.log("[v0] RaceGame - Participant:", participant)

      const allParticipants = await getMyTeamParticipants()
      console.log("[v0] RaceGame - All team participants:", allParticipants)

      const sorted = allParticipants.sort((a, b) => b.points - a.points)
      setRanking(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)

      const allSales = await getSales()
      const participantSales = allSales.filter((s) => s.participantId === participant.id)
      setSales(participantSales)

      // Calculate race progress (each sale moves avatar forward)
      const maxSales = 20 // Race finish line at 20 sales
      const progress = Math.min((participantSales.length / maxSales) * 100, 100)
      setRaceProgress(progress)

      const raceDataPromises = allParticipants.map(async (p) => {
        const pSales = allSales.filter((s) => s.participantId === p.id)
        const pProgress = Math.min((pSales.length / maxSales) * 100, 100)
        return {
          participant: p,
          salesCount: pSales.length,
          progress: pProgress,
        }
      })

      const raceData = await Promise.all(raceDataPromises)
      // Ordenar por progresso (maior primeiro)
      raceData.sort((a, b) => b.progress - a.progress)
      setAllRaceData(raceData)

      console.log("[v0] RaceGame - Race data:", raceData)
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
        <CardDescription>Cada venda faz seu avatar avançar - Veja seus oponentes!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-xs sm:text-sm">Carregando corrida...</p>
            </div>
          ) : allRaceData.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Zap className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhum participante na corrida</p>
            </div>
          ) : (
            allRaceData.map((data, index) => {
              const isCurrentUser = data.participant.id === participant.id
              return (
                <div
                  key={data.participant.id}
                  className={`relative bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 min-h-[80px] ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* Track Lines */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-1 bg-white rounded-full opacity-50" />
                    <div className="absolute w-full h-0.5 bg-gray-300 rounded-full" style={{ top: "45%" }} />
                    <div className="absolute w-full h-0.5 bg-gray-300 rounded-full" style={{ top: "55%" }} />
                  </div>

                  {/* Start Line */}
                  <div className="absolute left-4 top-2 bottom-2 w-1 bg-green-500 rounded-full" />

                  {/* Finish Line */}
                  <div className="absolute right-4 top-2 bottom-2 w-1 bg-red-500 rounded-full" />
                  <div className="absolute right-2 top-1">
                    <Flag className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </div>

                  {/* Avatar */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                    style={{ left: `${Math.max(8, Math.min(data.progress * 0.85 + 8, 85))}%` }}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${
                        isCurrentUser
                          ? "bg-gradient-to-br from-primary to-accent ring-2 ring-primary/50"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      } rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {data.participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Participant Info */}
                  <div className="absolute left-2 bottom-1 sm:bottom-2">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        isCurrentUser ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {data.participant.name.split(" ")[0]}
                      {isCurrentUser && " (Você)"}
                    </p>
                    <p className="text-xs text-muted-foreground">{data.salesCount} vendas</p>
                  </div>

                  {/* Position Badge */}
                  <div className="absolute right-2 bottom-1 sm:bottom-2">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Race Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Seu Progresso</span>
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

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Meta da Corrida</span>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground">Seja o primeiro a completar 20 vendas para vencer a corrida!</p>
        </div>
      </CardContent>
    </Card>
  )
}
