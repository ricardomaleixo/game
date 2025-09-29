"use client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantsManager } from "@/components/admin/participants-manager"
import { GameRulesManager } from "@/components/admin/game-rules-manager"
import { SalesManager } from "@/components/admin/sales-manager"
import { CompetitionsManager } from "@/components/admin/competitions-manager"
import { RankingView } from "@/components/admin/ranking-view"
import { ReportsDashboard } from "@/components/admin/reports-dashboard"
import { LogOut, Users, Settings, TrendingUp, Trophy, Target, FileText } from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center space-x-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="participants" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Participantes</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Regras</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="competitions" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Gincanas</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <ParticipantsManager />
          </TabsContent>

          <TabsContent value="rules">
            <GameRulesManager />
          </TabsContent>

          <TabsContent value="sales">
            <SalesManager />
          </TabsContent>

          <TabsContent value="competitions">
            <CompetitionsManager />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingView />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
