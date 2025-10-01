"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
import { getCompetitions, getParticipants } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TowerGame } from "@/components/games/tower-game"
import { RaceGame } from "@/components/games/race-game"
import { TreasureGame } from "@/components/games/treasure-game"
import { MedalsGame } from "@/components/games/medals-game"
import { MissionsGame } from "@/components/games/missions-game"
import { Gamepad2, Target, Clock } from "lucide-react"

export function GameVisualization() {
  const { user } = useAuth()
  const [activeCompetition, setActiveCompetition] = useState<Competition | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] GameVisualization - Iniciando carregamento de dados")
      console.log("[v0] GameVisualization - Usuário logado:", user)

      const allCompetitions = await getCompetitions()
      console.log("[v0] GameVisualization - Todas as competições carregadas:", allCompetitions)

      const now = new Date()
      console.log("[v0] GameVisualization - Data atual:", now)

      const currentActiveCompetition = allCompetitions.find((c) => {
        console.log(`[v0] GameVisualization - Verificando competição: ${c.name}`)
        console.log(`[v0] GameVisualization - isActive: ${c.isActive}`)
        console.log(`[v0] GameVisualization - startDate: ${c.startDate}`)
        console.log(`[v0] GameVisualization - endDate: ${c.endDate}`)

        if (!c.isActive) {
          console.log(`[v0] GameVisualization - Competição ${c.name} não está ativa`)
          return false
        }

        const startDate = new Date(c.startDate)
        const endDate = new Date(c.endDate)

        console.log(`[v0] GameVisualization - startDate parsed: ${startDate}`)
        console.log(`[v0] GameVisualization - endDate parsed: ${endDate}`)
        console.log(`[v0] GameVisualization - now >= startDate: ${now >= startDate}`)
        console.log(`[v0] GameVisualization - now <= endDate: ${now <= endDate}`)

        const isInPeriod = now >= startDate && now <= endDate
        console.log(`[v0] GameVisualization - Competição ${c.name} está no período: ${isInPeriod}`)

        return isInPeriod
      })

      console.log("[v0] GameVisualization - Competição ativa encontrada:", currentActiveCompetition)
      setActiveCompetition(currentActiveCompetition || null)

      const participants = await getParticipants()
      console.log("[v0] GameVisualization - Todos os participantes:", participants)

      const currentParticipant = participants.find((p) => p.email === user?.email)
      console.log("[v0] GameVisualization - Participante atual encontrado:", currentParticipant)
      console.log("[v0] GameVisualization - Email do usuário:", user?.email)

      setParticipant(currentParticipant || null)
    } catch (error) {
      console.error("Erro ao carregar dados da visualização de jogos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderGameComponent = (competition: Competition) => {
    if (!participant) return null

    const props = {
      competition,
      participant,
      key: competition.id,
    }

    switch (competition.type) {
      case "tower":
        return <TowerGame {...props} />
      case "race":
        return <RaceGame {...props} />
      case "treasure":
        return <TreasureGame {...props} />
      case "medals":
        return <MedalsGame {...props} />
      case "missions":
        return <MissionsGame {...props} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando gincanas...</p>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Participante não encontrado</p>
        <p className="text-sm text-muted-foreground mt-2">Email do usuário: {user?.email}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5" />
            <span>Gincana Ativa</span>
          </CardTitle>
          <CardDescription>Participe da competição atual e ganhe pontos extras</CardDescription>
        </CardHeader>
        <CardContent>
          {!activeCompetition ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma gincana ativa no momento</p>
              <p className="text-sm text-muted-foreground">Aguarde novas competições serem criadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{activeCompetition.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
                    Ativa
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(activeCompetition.startDate).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(activeCompetition.endDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
              {renderGameComponent(activeCompetition)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
