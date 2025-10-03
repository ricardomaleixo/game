"use client"
import { useAuth } from "@/hooks/use-auth-prisma"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantsManager } from "@/components/admin/participants-manager"
import { GameRulesManager } from "@/components/admin/game-rules-manager"
import { SalesManager } from "@/components/admin/sales-manager"
import { CompetitionsManager } from "@/components/admin/competitions-manager"
import { RankingView } from "@/components/admin/ranking-view"
import { LogOut, Users, Settings, TrendingUp, Trophy, Target } from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Painel Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Bem-vindo, {user?.name}</p>
                <p className="text-xs text-muted-foreground sm:hidden">{user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center space-x-1 sm:space-x-2 bg-transparent text-xs sm:text-sm px-2 sm:px-4">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="participants" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto sm:h-10">
            <TabsTrigger value="participants" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Participantes</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Regras</span>
              <span className="sm:hidden">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0 col-span-2 sm:col-span-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="competitions" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0 col-span-2 sm:col-span-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Gincanas</span>
              <span className="sm:hidden">Games</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0 col-span-2 sm:col-span-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Ranking</span>
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
        </Tabs>
      </main>
    </div>
  )
}
