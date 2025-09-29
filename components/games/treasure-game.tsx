"use client"

import { useState, useEffect } from "react"
import { getParticipants, getSales } from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Aperture as Treasure, Key, Gift, Star, Sparkles } from "lucide-react"

interface TreasureGameProps {
  competition: Competition
  participant: Participant
}

export function TreasureGame({ competition, participant }: TreasureGameProps) {
  const [treasures, setTreasures] = useState(0)
  const [keys, setKeys] = useState(0)
  const [ranking, setRanking] = useState<Participant[]>([])
  const [position, setPosition] = useState(0)
  const [recentTreasures, setRecentTreasures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTreasureData()
  }, [participant, competition])

  const loadTreasureData = async () => {
    setIsLoading(true)
    try {
      const allSales = await getSales()
      const sales = allSales.filter((s) => s.participantId === participant.id)

      // Each sale gives a key
      setKeys(sales.length)

      // Each key has a chance to open a treasure (simulate treasure finding)
      const treasureCount = Math.floor(sales.length * 0.7) // 70% chance per sale
      setTreasures(treasureCount)

      // Generate recent treasures found
      const treasureTypes = [
        "Baú de Ouro",
        "Gema Rara",
        "Moeda Antiga",
        "Cristal Mágico",
        "Pergaminho Secreto",
        "Anel Encantado",
        "Poção Misteriosa",
      ]
      const recent = sales.slice(-3).map(() => treasureTypes[Math.floor(Math.random() * treasureTypes.length)])
      setRecentTreasures(recent)

      // Get ranking
      const allParticipants = await getParticipants()
      const competitionParticipants = allParticipants.filter((p) => competition.participants.includes(p.id))
      const sorted = competitionParticipants.sort((a, b) => {
        const aSales = allSales.filter((s) => s.participantId === a.id).length
        const bSales = allSales.filter((s) => s.participantId === b.id).length
        return Math.floor(bSales * 0.7) - Math.floor(aSales * 0.7) // Sort by treasure count
      })
      setRanking(sorted)

      const pos = sorted.findIndex((p) => p.id === participant.id) + 1
      setPosition(pos)
    } catch (error) {
      console.error("Erro ao carregar dados do tesouro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderTreasureChests = () => {
    const chests = []
    const chestsToShow = Math.min(treasures, 12) // Show max 12 chests

    for (let i = 0; i < chestsToShow; i++) {
      chests.push(
        <div
          key={i}
          className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform cursor-pointer"
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <Treasure className="h-4 w-4 text-yellow-100" />
        </div>,
      )
    }

    return chests
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Treasure className="h-5 w-5 text-purple-600" />
          <span>Caça ao Tesouro</span>
        </CardTitle>
        <CardDescription>Cada venda te dá uma chave para abrir baús misteriosos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Treasure Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <Key className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{keys}</p>
            <p className="text-xs text-muted-foreground">Chaves</p>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <Treasure className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{treasures}</p>
            <p className="text-xs text-muted-foreground">Tesouros</p>
          </div>
        </div>

        {/* Treasure Collection */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4 min-h-[120px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Sua Coleção</span>
            </span>
            <Badge variant={position <= 3 ? "default" : "secondary"}>#{position}</Badge>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">Carregando tesouros...</p>
            </div>
          ) : treasures === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Seus tesouros aparecerão aqui</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">{renderTreasureChests()}</div>
          )}
        </div>

        {/* Recent Discoveries */}
        {recentTreasures.length > 0 && (
          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Descobertas Recentes</span>
            </div>
            <div className="space-y-1">
              {recentTreasures.map((treasure, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-muted-foreground">{treasure}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competition Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Objetivo</span>
            <Treasure className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Colete o maior número de tesouros! Cada venda te dá uma chave com chance de encontrar tesouros raros.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
