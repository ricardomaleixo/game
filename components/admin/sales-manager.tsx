"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getSales,
  getParticipants,
  getGameRules,
  saveSale,
  updateSale,
  deleteSale,
} from "@/app/actions/database-actions"
import type { Sale, Participant, GameRule } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export function SalesManager() {
  const [sales, setSales] = useState<Sale[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rules, setRules] = useState<GameRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    sale: Sale | null
  }>({ isOpen: false, sale: null })
  const [formData, setFormData] = useState({
    participantId: "",
    productName: "",
    type: "sale" as "sale" | "rental",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [salesData, participantsData, rulesData] = await Promise.all([
        getSales(),
        getParticipants(),
        getGameRules(),
      ])
      setSales(salesData)
      setParticipants(participantsData)
      setRules(rulesData)
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePoints = (productName: string): number => {
    console.log("[v0] Calculando pontos para:", { productName, rules })
    const rule = rules.find((r) => r.productName === productName && r.isActive)
    console.log("[v0] Regra encontrada:", rule)

    if (!rule) {
      console.log("[v0] Nenhuma regra encontrada, usando pontos padrão: 10")
      return 10 // Pontos padrão
    }

    console.log("[v0] Pontos calculados:", rule.points)
    return rule.points // Retorna pontos fixos da regra
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const points = calculatePoints(formData.productName)

      await saveSale({
        participantId: formData.participantId,
        productName: formData.productName,
        points,
        date: new Date().toISOString(),
        type: formData.type,
      })

      setFormData({ participantId: "", productName: "", type: "sale" })
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error("[v0] Erro ao salvar venda:", error)
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      participantId: sale.participantId,
      productName: sale.productName,
      type: sale.type,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSale) return

    try {
      const points = calculatePoints(formData.productName)

      await updateSale(editingSale.id, {
        participantId: formData.participantId,
        productName: formData.productName,
        points,
        type: formData.type,
      })

      setEditingSale(null)
      setFormData({ participantId: "", productName: "", type: "sale" })
      setIsEditDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error("[v0] Erro ao atualizar venda:", error)
    }
  }

  const handleDelete = (sale: Sale) => {
    setDeleteConfirmation({ isOpen: true, sale })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.sale) {
      try {
        await deleteSale(deleteConfirmation.sale.id)
        await loadData()
      } catch (error) {
        console.error("[v0] Erro ao deletar venda:", error)
      }
    }
    setDeleteConfirmation({ isOpen: false, sale: null })
  }

  const getParticipantName = (id: string) => {
    const participant = participants.find((p) => p.id === id)
    return participant?.name || "Desconhecido"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>📈</span>
                <span>Registrar Vendas</span>
              </CardTitle>
              <CardDescription>Registre vendas e locações para calcular automaticamente os pontos</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <span>➕</span>
                  <span>Nova Venda</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span>📈</span>
                    <span>Registrar Venda/Locação</span>
                  </DialogTitle>
                  <DialogDescription>Adicione uma nova venda ou locação ao sistema</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="participant">Vendedor</Label>
                    <Select
                      value={formData.participantId}
                      onValueChange={(value) => setFormData({ ...formData, participantId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.name} - {participant.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Produto/Serviço</Label>
                    <Select
                      value={formData.productName}
                      onValueChange={(value) => setFormData({ ...formData, productName: value })}
                    >
                      <SelectTrigger className="w-full min-h-[44px]">
                        <SelectValue placeholder="Selecione o produto/serviço" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[400px]">
                        {rules
                          .filter((r) => r.isActive)
                          .map((rule) => (
                            <SelectItem key={rule.id} value={rule.productName} className="max-w-[380px]">
                              <div className="flex flex-col items-start w-full">
                                <span className="font-medium text-sm">{rule.productName}</span>
                                <span className="text-xs text-muted-foreground">{rule.points} pts</span>
                              </div>
                            </SelectItem>
                          ))}
                        {rules.filter((r) => r.isActive).length === 0 && (
                          <SelectItem value="" disabled>
                            Nenhuma regra ativa encontrada
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "sale" | "rental") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="rental">Locação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.productName && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Pontos calculados:</p>
                        <span className="font-semibold text-chart-1 text-lg">
                          {calculatePoints(formData.productName)} pts
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">📈</span>
              <p className="text-muted-foreground">Nenhuma venda registrada ainda</p>
              <p className="text-sm text-muted-foreground">Registre vendas para começar a pontuar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <span className="font-medium">{getParticipantName(sale.participantId)}</span>
                    </TableCell>
                    <TableCell>
                      <span>{sale.productName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-chart-1">{sale.points} pts</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.type === "sale" ? "default" : "secondary"}>
                        {sale.type === "sale" ? "Venda" : "Locação"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span>{new Date(sale.date).toLocaleDateString("pt-BR")}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(sale)} className="h-8 w-8 p-0">
                          ✏️
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sale)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          🗑️
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>✏️</span>
              <span>Editar Venda/Locação</span>
            </DialogTitle>
            <DialogDescription>Edite os dados da venda ou locação</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant">Vendedor</Label>
              <Select
                value={formData.participantId}
                onValueChange={(value) => setFormData({ ...formData, participantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.name} - {participant.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Produto/Serviço</Label>
              <Select
                value={formData.productName}
                onValueChange={(value) => setFormData({ ...formData, productName: value })}
              >
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="Selecione o produto/serviço" />
                </SelectTrigger>
                <SelectContent className="max-w-[400px]">
                  {rules
                    .filter((r) => r.isActive)
                    .map((rule) => (
                      <SelectItem key={rule.id} value={rule.productName} className="max-w-[380px]">
                        <div className="flex flex-col items-start w-full">
                          <span className="font-medium text-sm">{rule.productName}</span>
                          <span className="text-xs text-muted-foreground">{rule.points} pts</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "sale" | "rental") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="rental">Locação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.productName && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pontos calculados:</p>
                  <span className="font-semibold text-chart-1 text-lg">
                    {calculatePoints(formData.productName)} pts
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, sale: null })}
        onConfirm={confirmDelete}
        title="Excluir Venda"
        description={`Tem certeza que deseja excluir a venda de "${deleteConfirmation.sale?.productName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
