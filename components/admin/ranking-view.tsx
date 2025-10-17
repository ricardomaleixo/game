"use client"

import { useState, useEffect } from "react"
import { getRanking, getCompetitions, declareWinners } from "@/app/actions/database-actions"
import type { Participant } from "@/lib/database"
import { reportsService } from "@/lib/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Crown, Star, Download, RefreshCw } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export function RankingView() {
  const [ranking, setRanking] = useState<Participant[]>([])
  const [winners, setWinners] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeCompetition, setActiveCompetition] = useState<string>("")
  const [winnersConfirmation, setWinnersConfirmation] = useState(false)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    setIsLoading(true)
    try {
      const rankingData = await getRanking()
      setRanking(rankingData)

      const competitions = await getCompetitions()

      const active = competitions.find((c) => c.isActive)
      setActiveCompetition(active?.name || "Nenhuma gincana ativa")

      const competitionWinners: { [key: string]: string } = {}

      competitions.forEach(async (competition) => {
        const winner = await reportsService.determineWinner(competition)
        competitionWinners[competition.type] = winner.name
      })

      setWinners(competitionWinners)
    } catch (error) {
      console.error("Erro ao carregar ranking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const declareWinnersHandler = () => {
    setWinnersConfirmation(true)
  }

  const confirmDeclareWinners = async () => {
    setIsLoading(true)
    try {
      await declareWinners()
      await loadRanking()
    } catch (error) {
      console.error("Erro ao declarar vencedores:", error)
      alert(error instanceof Error ? error.message : "Erro ao declarar vencedores")
    } finally {
      setIsLoading(false)
      setWinnersConfirmation(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">1º Lugar</Badge>
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">2º Lugar</Badge>
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">3º Lugar</Badge>
      default:
        return <Badge variant="outline">{position}º Lugar</Badge>
    }
  }

  const exportRanking = async () => {
    const reportData = await reportsService.generateFullReport()
    const csv = reportsService.exportToCSV(reportData)

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ranking-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Ranking Atual</span>
              </CardTitle>
              <CardDescription>
                Gincana: <span className="font-semibold">{activeCompetition}</span>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={declareWinnersHandler}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 hover:from-yellow-600 hover:to-orange-600"
                disabled={isLoading}
              >
                <Trophy className="h-4 w-4" />
                <span>Declarar Vencedores</span>
              </Button>
              <Button
                variant="outline"
                onClick={loadRanking}
                className="flex items-center space-x-2 bg-transparent"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{isLoading ? "Atualizando..." : "Atualizar"}</span>
              </Button>
              <Button onClick={exportRanking} className="flex items-center space-x-2" disabled={isLoading}>
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ranking...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum participante com pontuação ainda</p>
              <p className="text-sm text-muted-foreground">Registre vendas para ver o ranking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              {ranking.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="bg-gradient-to-t from-gray-100 to-gray-200 rounded-lg p-4 h-24 flex items-end justify-center">
                      <div className="text-center">
                        <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-semibold text-sm">{ranking[1]?.name}</p>
                        <p className="text-xs text-muted-foreground">{ranking[1]?.points} pts</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-2">2º Lugar</p>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="bg-gradient-to-t from-yellow-100 to-yellow-200 rounded-lg p-4 h-32 flex items-end justify-center">
                      <div className="text-center">
                        <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                        <p className="font-bold">{ranking[0]?.name}</p>
                        <p className="text-sm text-muted-foreground">{ranking[0]?.points} pts</p>
                      </div>
                    </div>
                    <p className="font-bold text-yellow-600 mt-2">1º Lugar</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="bg-gradient-to-t from-amber-100 to-amber-200 rounded-lg p-4 h-20 flex items-end justify-center">
                      <div className="text-center">
                        <Award className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                        <p className="font-semibold text-sm">{ranking[2]?.name}</p>
                        <p className="text-xs text-muted-foreground">{ranking[2]?.points} pts</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-2">3º Lugar</p>
                  </div>
                </div>
              )}

              {/* Competition Winners Summary */}
              {Object.keys(winners).length > 0 && (
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      <span>Vencedores por Gincana</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(winners).map(([type, winner]) => {
                        const typeNames: { [key: string]: string } = {
                          tower: "Torre de Pontos",
                          race: "Corrida Virtual",
                          treasure: "Caça ao Tesouro",
                          medals: "Ranking de Medalhas",
                          missions: "Missões Semanais",
                        }

                        return (
                          <div key={type} className="text-center p-3 bg-white/50 rounded-lg">
                            <p className="text-sm font-medium text-purple-700">{typeNames[type] || type}</p>
                            <p className="text-xs text-muted-foreground">{winner}</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Ranking List */}
              <div className="space-y-3">
                {ranking.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3 ? "bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <p className="font-semibold">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{participant.points}</p>
                        <p className="text-sm text-muted-foreground">pontos</p>
                      </div>
                      {getRankBadge(index + 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={winnersConfirmation}
        onClose={() => setWinnersConfirmation(false)}
        onConfirm={confirmDeclareWinners}
        title="Declarar Vencedores"
        description="Ao declarar os vencedores, os 3 primeiros colocados receberão medalhas (ouro, prata e bronze), seus pontos serão salvos no histórico de conquistas, todos os pontos e vendas serão zerados e a gincana será encerrada. Deseja continuar?"
        confirmText="Declarar Vencedores"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  )
}
