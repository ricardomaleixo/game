"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
import { getParticipants, getSales } from "@/app/actions/database-actions"
import type { Sale, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Star, Calendar, Trophy, Zap } from "lucide-react"

export function PerformanceOverview() {
  const { user } = useAuth()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    rankingPosition: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const participants = await getParticipants()
      const currentParticipant = participants.find((p) => p.email === user?.email)
      setParticipant(currentParticipant || null)

      if (currentParticipant) {
        const allSales = await getSales()
        const participantSales = allSales.filter((s) => s.participantId === currentParticipant.id)
        setSales(participantSales)

        // Calculate stats - using points instead of value since we don't have value field
        const totalRevenue = participantSales.reduce((sum, sale) => sum + sale.points * 10, 0) // Assuming points * 10 = value
        const averageTicket = participantSales.length > 0 ? totalRevenue / participantSales.length : 0

        // This week sales
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const thisWeekSales = participantSales.filter((s) => new Date(s.date) >= oneWeekAgo).length

        // This month sales
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const thisMonthSales = participantSales.filter((s) => new Date(s.date) >= oneMonthAgo).length

        // Ranking position
        const ranking = participants.sort((a, b) => b.points - a.points)
        const rankingPosition = ranking.findIndex((p) => p.id === currentParticipant.id) + 1

        setStats({
          totalSales: participantSales.length,
          totalRevenue,
          averageTicket,
          thisWeekSales,
          thisMonthSales,
          rankingPosition,
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dados de performance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando dados de performance...</p>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Participante não encontrado</p>
      </div>
    )
  }

  const progressToNextLevel = participant.points % 100 // Simulated level system
  const currentLevel = Math.floor(participant.points / 100) + 1

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Star className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{participant.points}</div>
            <p className="text-xs text-muted-foreground">Nível {currentLevel}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">+{stats.thisWeekSales} esta semana</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posição</CardTitle>
            <Trophy className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">#{stats.rankingPosition}</div>
            <p className="text-xs text-muted-foreground">no ranking geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Progresso do Nível</span>
          </CardTitle>
          <CardDescription>Você está no nível {currentLevel}. Continue vendendo para subir de nível!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nível {currentLevel}</span>
            <span className="text-sm text-muted-foreground">Nível {currentLevel + 1}</span>
          </div>
          <Progress value={progressToNextLevel} className="progress-pulse" />
          <p className="text-sm text-muted-foreground text-center">
            {100 - progressToNextLevel} pontos para o próximo nível
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Atividade Recente</span>
          </CardTitle>
          <CardDescription>Suas últimas vendas e conquistas</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma venda registrada ainda</p>
              <p className="text-sm text-muted-foreground">Suas vendas aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales
                .slice(-5)
                .reverse()
                .map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{sale.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        +{sale.points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
