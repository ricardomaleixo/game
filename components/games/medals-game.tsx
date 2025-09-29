"use client"

import { useState, useEffect } from "react"
import { getParticipants, getSales } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Medal, Trophy, Award, Star, Crown } from "lucide-react"

interface MedalsGameProps {
  competition: Competition
  participant: Participant
}

interface MedalData {
  type: "gold" | "silver" | "bronze"
  title: string
  description: string
  earned: boolean
  date?: string
}

export function MedalsGame({ competition, participant }: MedalsGameProps) {
  const [medals, setMedals] = useState<MedalData[]>([])
  const [totalMedals, setTotalMedals] = useState({ gold: 0, silver: 0, bronze: 0 })
  const [ranking, setRanking] = useState<Participant[]>([])
  const [position, setPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadMedalsData()
  }, [participant, competition])

  const loadMedalsData = async () => {
    setIsLoading(true)
    try {
      const allSales = await getSales()
      const sales = allSales.filter((s) => s.participantId === participant.id)
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.points * 10, 0) // Assuming points represent value
      const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0

      // Define medal criteria and check if earned
      const medalCriteria: MedalData[] = [
        {
          type: "bronze",
          title: "Primeira Venda",
          description: "Realize sua primeira venda",
          earned: sales.length >= 1,
          date: sales[0]?.date,
        },
        {
          type: "bronze",
          title: "Vendedor Iniciante",
          description: "Realize 3 vendas",
          earned: sales.length >= 3,
          date: sales[2]?.date,
        },
        {
          type: "silver",
          title: "Vendedor Experiente",
          description: "Realize 5 vendas",
          earned: sales.length >= 5,
          date: sales[4]?.date,
        },
        {
          type: "silver",
          title: "Alto Valor",
          description: "Venda acima de 50 pontos",
          earned: sales.some((s) => s.points >= 50),
          date: sales.find((s) => s.points >= 50)?.date,
        },
        {
          type: "gold",
          title: "Vendedor Expert",
          description: "Realize 10 vendas",
          earned: sales.length >= 10,
          date: sales[9]?.date,
        },
        {
          type: "gold",
          title: "Ticket Premium",
          description: "Ticket médio acima de 30 pontos",
          earned: averageTicket >= 300,
          date: sales.length >= 3 ? sales[2]?.date : undefined,
        },
      ]

      setMedals(medalCriteria)

      // Count medals by type
      const goldCount = medalCriteria.filter((m) => m.type === "gold" && m.earned).length
      const silverCount = medalCriteria.filter((m) => m.type === "silver" && m.earned).length
      const bronzeCount = medalCriteria.filter((m) => m.type === "bronze" && m.earned).length

      setTotalMedals({ gold: goldCount, silver: silverCount, bronze: bronzeCount })

      // Calculate ranking based on medal score (gold=3, silver=2, bronze=1)
      const allParticipants = await getParticipants()
      const competitionParticipants = allParticipants.filter((p) => competition.participants.includes(p.id))

      const participantsWithScores = competitionParticipants.map((p) => {
        const pSales = allSales.filter((s) => s.participantId === p.id)
        const pRevenue = pSales.reduce((sum, sale) => sum + sale.points * 10, 0)
        const pAverage = pSales.length > 0 ? pRevenue / pSales.length : 0

        const pMedals = medalCriteria.map((criteria) => {
          switch (criteria.title) {
            case "Primeira Venda":
              return { ...criteria, earned: pSales.length >= 1 }
            case "Vendedor Iniciante":
              return { ...criteria, earned: pSales.length >= 3 }
            case "Vendedor Experiente":
              return { ...criteria, earned: pSales.length >= 5 }
            case "Alto Valor":
              return { ...criteria, earned: pSales.some((s) => s.points >= 50) }
            case "Vendedor Expert":
              return { ...criteria, earned: pSales.length >= 10 }
            case "Ticket Premium":
              return { ...criteria, earned: pAverage >= 300 }
            default:
              return criteria
          }
        })

        const score = pMedals.reduce((sum, medal) => {
          if (!medal.earned) return sum
          return sum + (medal.type === "gold" ? 3 : medal.type === "silver" ? 2 : 1)
        }, 0)

        return { ...p, medalScore: score }
      })

      const sorted = participantsWithScores.sort((a: any, b: any) => b.medalScore - a.medalScore)
      setRanking(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)
    } catch (error) {
      console.error("Erro ao carregar dados das medalhas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMedalIcon = (type: MedalData["type"], earned: boolean) => {
    const className = `h-8 w-8 ${earned ? "medal-shine" : "opacity-30"}`

    switch (type) {
      case "gold":
        return <Trophy className={`${className} ${earned ? "text-yellow-500" : "text-gray-400"}`} />
      case "silver":
        return <Medal className={`${className} ${earned ? "text-gray-400" : "text-gray-300"}`} />
      case "bronze":
        return <Award className={`${className} ${earned ? "text-amber-600" : "text-gray-400"}`} />
    }
  }

  const getMedalBgColor = (type: MedalData["type"], earned: boolean) => {
    if (!earned) return "bg-gray-100 border-gray-200"

    switch (type) {
      case "gold":
        return "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300"
      case "silver":
        return "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
      case "bronze":
        return "bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Medal className="h-5 w-5 text-yellow-600" />
          <span>Ranking de Medalhas</span>
        </CardTitle>
        <CardDescription>Ganhe medalhas cumprindo metas específicas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medal Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{totalMedals.gold}</p>
            <p className="text-xs text-muted-foreground">Ouro</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
            <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">{totalMedals.silver}</p>
            <p className="text-xs text-muted-foreground">Prata</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{totalMedals.bronze}</p>
            <p className="text-xs text-muted-foreground">Bronze</p>
          </div>
        </div>

        {/* Position */}
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">#{position}</span>
          </div>
          <Badge variant={position <= 3 ? "default" : "secondary"}>
            {position <= 3 ? "Top Performer" : "Continue assim!"}
          </Badge>
        </div>

        {/* Medals Grid */}
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Carregando medalhas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {medals.map((medal, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getMedalBgColor(medal.type, medal.earned)}`}>
                <div className="flex items-center space-x-3">
                  {getMedalIcon(medal.type, medal.earned)}
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${medal.earned ? "" : "text-muted-foreground"}`}>
                      {medal.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{medal.description}</p>
                    {medal.earned && medal.date && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {new Date(medal.date).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sistema de Pontuação</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>🥇 Medalha de Ouro = 3 pontos</p>
            <p>🥈 Medalha de Prata = 2 pontos</p>
            <p>🥉 Medalha de Bronze = 1 ponto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
