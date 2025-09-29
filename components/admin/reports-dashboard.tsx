"use client"

import { useState, useEffect } from "react"
import { reportsService, type ReportData } from "@/lib/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  FileText,
  Trophy,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  Target,
  BarChart3,
} from "lucide-react"

export function ReportsDashboard() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateReport()
  }, [])

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const data = reportsService.generateFullReport(dateRange.startDate, dateRange.endDate)
      setReportData(data)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportParticipantsCSV = () => {
    if (!reportData) return

    const csv = reportsService.exportToCSV(reportData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-participantes-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportCompetitionsCSV = () => {
    if (!reportData) return

    const csv = reportsService.exportCompetitionsToCSV(reportData.competitions)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-gincanas-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Gerador de Relatórios</span>
          </CardTitle>
          <CardDescription>Configure o período e gere relatórios detalhados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={generateReport} disabled={isGenerating} className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>{isGenerating ? "Gerando..." : "Gerar Relatório"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{reportData.summary.totalParticipants}</div>
            <p className="text-xs text-blue-600">Total ativo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{reportData.summary.totalSales}</div>
            <p className="text-xs text-green-600">{reportData.period}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              R$ {(reportData.summary.totalRevenue || 0).toFixed(0)}
            </div>
            <p className="text-xs text-yellow-600">
              Ticket médio: R$ {(reportData.summary.averageTicketOverall || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-700">{reportData.summary.topPerformer}</div>
            <p className="text-xs text-purple-600">{reportData.summary.competitionsActive} gincanas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Ranking de Participantes</TabsTrigger>
          <TabsTrigger value="competitions">Relatório de Gincanas</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Ranking Detalhado</span>
                  </CardTitle>
                  <CardDescription>Performance completa de todos os participantes</CardDescription>
                </div>
                <Button
                  onClick={exportParticipantsCSV}
                  variant="outline"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Ticket Médio</TableHead>
                    <TableHead>Conquistas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {participant.rankingPosition <= 3 && (
                            <Trophy
                              className={`h-4 w-4 ${
                                participant.rankingPosition === 1
                                  ? "text-yellow-500"
                                  : participant.rankingPosition === 2
                                    ? "text-gray-400"
                                    : "text-amber-600"
                              }`}
                            />
                          )}
                          <span className="font-semibold">#{participant.rankingPosition}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.position}</TableCell>
                      <TableCell>{participant.totalSales}</TableCell>
                      <TableCell>R$ {(participant.totalRevenue || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{participant.totalPoints} pts</Badge>
                      </TableCell>
                      <TableCell>R$ {(participant.averageTicket || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>{participant.achievements}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Relatório de Gincanas</span>
                  </CardTitle>
                  <CardDescription>Resultados e vencedores de todas as competições</CardDescription>
                </div>
                <Button
                  onClick={exportCompetitionsCSV}
                  variant="outline"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.competitions.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma gincana encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gincana</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Vencedor</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.competitions.map((competition) => (
                      <TableRow key={competition.id}>
                        <TableCell className="font-medium">{competition.name}</TableCell>
                        <TableCell>{competition.type}</TableCell>
                        <TableCell className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{competition.winner}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{competition.winnerPoints} pts</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{competition.participantsCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(competition.startDate).toLocaleDateString("pt-BR")} -{" "}
                            {new Date(competition.endDate).toLocaleDateString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={competition.isCompleted ? "default" : "secondary"}>
                            {competition.isCompleted ? "Finalizada" : "Ativa"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
