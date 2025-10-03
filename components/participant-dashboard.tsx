"use client"

import { useAuth } from "@/hooks/use-auth-prisma"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceOverview } from "@/components/participant/performance-overview"
import { GameVisualization } from "@/components/participant/game-visualization"
import { TeamComparison } from "@/components/participant/team-comparison"
import { Achievements } from "@/components/participant/achievements"
import { LogOut, BarChart3, Gamepad2, Users, Award } from "lucide-react"

export function ParticipantDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm sm:text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Meu Painel</h1>
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
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Gincana</span>
              <span className="sm:hidden">Game</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-0">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Conquistas</span>
              <span className="sm:hidden">Awards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PerformanceOverview />
          </TabsContent>

          <TabsContent value="games">
            <GameVisualization />
          </TabsContent>

          <TabsContent value="team">
            <TeamComparison />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
