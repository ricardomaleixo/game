"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
import { getMyCompetitions, getMyParticipantData } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TowerGame } from "@/components/games/tower-game"
import { RaceGame } from "@/components/games/race-game"
import { TreasureGame } from "@/components/games/treasure-game"
import { MedalsGame } from "@/components/games/medals-game"
import { MissionsGame } from "@/components/games/missions-game"
import { Gamepad2, Target, Clock, Trophy } from "lucide-react"

export function GameVisualization() {
  const { user } = useAuth()
  const [activeCompetition, setActiveCompetition] = useState<Competition | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const allCompetitions = await getMyCompetitions()
      setAllCompetitions(allCompetitions)

      const now = new Date()

      const currentActiveCompetition = allCompetitions.find((c) => {
        if (!c.isActive) {
          return false
        }

        // Converter strings de data para objetos Date, ignorando horário
        const startDate = new Date(c.startDate)
        const endDate = new Date(c.endDate)

        // Normalizar as datas para meia-noite para comparação apenas da data
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

        const isAfterStart = currentDate >= startDateOnly
        const isBeforeEnd = currentDate <= endDateOnly

        const isInPeriod = isAfterStart && isBeforeEnd

        return isInPeriod
      })

      setActiveCompetition(currentActiveCompetition || null)

      const currentParticipant = await getMyParticipantData()

      setParticipant(currentParticipant)
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

  const renderCompetitionCard = (competition: Competition, isActive = false) => {
    return (
      <Card key={competition.id} className="mb-4">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-base sm:text-lg">{competition.name}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 w-fit" : "w-fit"}>
                {isActive ? "Ativa" : "Inativa"}
              </Badge>
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  {new Date(competition.startDate).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(competition.endDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">{renderGameComponent(competition)}</CardContent>
      </Card>
    )
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
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4" />
            <span>Gincana Ativa</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Todas ({allCompetitions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Gincana Ativa</span>
              </CardTitle>
              <CardDescription className="text-sm">Participe da competição atual e ganhe pontos extras</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!activeCompetition ? (
                <div className="text-center py-6 sm:py-8">
                  <Target className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base">Nenhuma gincana ativa no momento</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aguarde novas competições serem criadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <h3 className="font-semibold text-base sm:text-lg">{activeCompetition.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Badge variant="default" className="bg-green-500 w-fit">
                        Ativa
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
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
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {allCompetitions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma gincana cadastrada</p>
                <p className="text-sm text-muted-foreground mt-2">Aguarde o administrador criar competições</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allCompetitions.map((competition) => {
                const isActive = activeCompetition?.id === competition.id
                return renderCompetitionCard(competition, isActive)
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
