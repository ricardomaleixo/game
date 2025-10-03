"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-prisma"
import { getMyAchievements, getMySales, getMyParticipantData } from "@/app/actions/database-actions"
import type { Achievement, Sale, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAchievements: 0,
    goldMedals: 0,
    silverMedals: 0,
    bronzeMedals: 0,
    treasures: 0,
    completedMissions: 0,
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [currentParticipant, participantAchievements, participantSales] = await Promise.all([
        getMyParticipantData(),
        getMyAchievements(),
        getMySales(),
      ])

      if (currentParticipant) {
        setAchievements(participantAchievements)
        setSales(participantSales)

        // Calculate achievement stats
        const goldMedals = participantAchievements.filter((a: Achievement) => a.type === "gold").length
        const silverMedals = participantAchievements.filter((a: Achievement) => a.type === "silver").length
        const bronzeMedals = participantAchievements.filter((a: Achievement) => a.type === "bronze").length
        const treasures = participantAchievements.filter((a: Achievement) => a.type === "treasure").length
        const completedMissions = participantAchievements.filter((a: Achievement) => a.type === "mission").length

        setStats({
          totalAchievements: participantAchievements.length,
          goldMedals,
          silverMedals,
          bronzeMedals,
          treasures,
          completedMissions,
        })
      }
    } catch (error) {
      console.error("Error loading achievements data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAchievementIcon = (type: Achievement["type"]) => {
    switch (type) {
      case "gold":
        return <span className="text-2xl">🏆</span>
      case "silver":
        return <span className="text-2xl">🥈</span>
      case "bronze":
        return <span className="text-2xl">🥉</span>
      case "treasure":
        return <span className="text-2xl">💎</span>
      case "mission":
        return <span className="text-2xl">🎯</span>
      default:
        return <span className="text-2xl">🏅</span>
    }
  }

  const getAchievementColor = (type: Achievement["type"]) => {
    switch (type) {
      case "gold":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
      case "silver":
        return "bg-gray-400/10 border-gray-400/20 text-gray-700"
      case "bronze":
        return "bg-amber-600/10 border-amber-600/20 text-amber-700"
      case "treasure":
        return "bg-purple-500/10 border-purple-500/20 text-purple-700"
      case "mission":
        return "bg-green-500/10 border-green-500/20 text-green-700"
      default:
        return "bg-muted"
    }
  }

  // Generate some sample achievements based on sales data
  const generateSampleAchievements = () => {
    const sampleAchievements = []

    if (sales.length >= 1) {
      sampleAchievements.push({
        id: "first-sale",
        type: "bronze" as const,
        description: "Primeira Venda",
        points: 50,
        date: sales[0]?.date || new Date().toISOString(),
      })
    }

    if (sales.length >= 5) {
      sampleAchievements.push({
        id: "five-sales",
        type: "silver" as const,
        description: "5 Vendas Realizadas",
        points: 100,
        date: sales[4]?.date || new Date().toISOString(),
      })
    }

    if (sales.length >= 10) {
      sampleAchievements.push({
        id: "ten-sales",
        type: "gold" as const,
        description: "10 Vendas Realizadas",
        points: 200,
        date: sales[9]?.date || new Date().toISOString(),
      })
    }

    return sampleAchievements
  }

  const displayAchievements = achievements.length > 0 ? achievements : generateSampleAchievements()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="text-center">
              <CardContent className="pt-6">
                <div className="h-8 w-8 bg-muted rounded mx-auto mb-2" />
                <div className="h-6 w-8 bg-muted rounded mx-auto mb-1" />
                <div className="h-3 w-12 bg-muted rounded mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">🏅</span>
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">🏆</span>
            <div className="text-2xl font-bold">{stats.goldMedals}</div>
            <p className="text-xs text-muted-foreground">Ouro</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">🥈</span>
            <div className="text-2xl font-bold">{stats.silverMedals}</div>
            <p className="text-xs text-muted-foreground">Prata</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">🥉</span>
            <div className="text-2xl font-bold">{stats.bronzeMedals}</div>
            <p className="text-xs text-muted-foreground">Bronze</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">💎</span>
            <div className="text-2xl font-bold">{stats.treasures}</div>
            <p className="text-xs text-muted-foreground">Tesouros</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <span className="text-2xl block mb-2">🎯</span>
            <div className="text-2xl font-bold">{stats.completedMissions}</div>
            <p className="text-xs text-muted-foreground">Missões</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">🏅</span>
            <span>Suas Conquistas</span>
          </CardTitle>
          <CardDescription>Todas as medalhas e conquistas que você desbloqueou</CardDescription>
        </CardHeader>
        <CardContent>
          {displayAchievements.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-4">🏅</span>
              <p className="text-muted-foreground">Nenhuma conquista ainda</p>
              <p className="text-sm text-muted-foreground">Faça vendas para desbloquear conquistas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayAchievements.map((achievement, index) => (
                <div
                  key={achievement.id || index}
                  className={`p-4 rounded-lg border ${getAchievementColor(achievement.type)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getAchievementIcon(achievement.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.description}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <span>📅</span>
                          <span>{new Date(achievement.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">🎯</span>
            <span>Próximas Conquistas</span>
          </CardTitle>
          <CardDescription>Conquistas que você pode desbloquear em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sales.length < 20 && (
              <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl opacity-50">🏆</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground">Vendedor Expert</h3>
                    <p className="text-sm text-muted-foreground">Realize 20 vendas</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        +300 pts
                      </Badge>
                      <span className="text-xs text-muted-foreground">{sales.length}/20 vendas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="flex items-center space-x-3">
                <span className="text-2xl opacity-50">💎</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">Venda Premium</h3>
                  <p className="text-sm text-muted-foreground">Venda acima de R$ 1.000</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      +250 pts
                    </Badge>
                    <span className="text-xs text-muted-foreground">0/1 vendas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
