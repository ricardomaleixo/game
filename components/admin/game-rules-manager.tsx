"use client"

import { Switch } from "@/components/ui/switch"
import type React from "react"
import { useState, useEffect } from "react"
import { getGameRules, saveGameRule, updateGameRule, deleteGameRule } from "@/app/actions/database-actions"
import type { GameRule } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Package, Star, Edit, Trash2 } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export function GameRulesManager() {
  const [rules, setRules] = useState<GameRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<GameRule | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    ruleId: string | null
  }>({ isOpen: false, ruleId: null })
  const [formData, setFormData] = useState({
    productName: "",
    points: "",
    isActive: true,
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      setIsLoading(true)
      const rulesData = await getGameRules()
      setRules(rulesData)
    } catch (error) {
      console.error("[v0] Erro ao carregar regras:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingRule) {
        await updateGameRule(editingRule.id, {
          productName: formData.productName,
          points: Number.parseInt(formData.points),
          isActive: formData.isActive,
        })
      } else {
        await saveGameRule({
          productName: formData.productName,
          points: Number.parseInt(formData.points),
          isActive: formData.isActive,
        })
      }

      resetForm()
      await loadRules()
    } catch (error) {
      console.error("[v0] Erro ao salvar regra:", error)
    }
  }

  const resetForm = () => {
    setFormData({ productName: "", points: "", isActive: true })
    setEditingRule(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (rule: GameRule) => {
    setEditingRule(rule)
    setFormData({
      productName: rule.productName,
      points: rule.points.toString(),
      isActive: rule.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, ruleId: id })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.ruleId) {
      try {
        await deleteGameRule(deleteConfirmation.ruleId)
        await loadRules()
      } catch (error) {
        console.error("[v0] Erro ao deletar regra:", error)
      }
    }
    setDeleteConfirmation({ isOpen: false, ruleId: null })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando regras...</p>
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
                <Settings className="h-5 w-5" />
                <span>Regras de Pontuação</span>
              </CardTitle>
              <CardDescription>Defina quantos pontos cada produto ou serviço vale</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2" onClick={() => setEditingRule(null)}>
                  <Plus className="h-4 w-4" />
                  <span>Nova Regra</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>{editingRule ? "Editar" : "Criar"} Regra de Pontuação</span>
                  </DialogTitle>
                  <DialogDescription>
                    {editingRule
                      ? "Edite a regra de pontuação"
                      : "Configure os pontos que cada produto ou serviço vale"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Produto/Serviço</Label>
                    <Input
                      id="productName"
                      placeholder="Ex: Vestido bordado, Acessório premium"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Pontos</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="40"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Pontos fixos que o produto/serviço vale</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Regra ativa</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingRule ? "Salvar" : "Criar"} Regra</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Nenhuma regra configurada ainda</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Crie regras para definir a pontuação dos produtos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead>Produto/Serviço</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id} className="block sm:table-row border-b sm:border-b-0 p-3 sm:p-0 mb-3 sm:mb-0 bg-card rounded-lg sm:bg-transparent sm:rounded-none">
                      <TableCell className="block sm:table-cell sm:flex sm:items-center sm:space-x-2">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Produto/Serviço:</span>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{rule.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Pontos:</span>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-chart-1" />
                          <span className="font-semibold">{rule.points} pts</span>
                        </div>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Status:</span>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="block sm:table-cell sm:text-right">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Ações:</span>
                        <div className="flex items-center sm:justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rule)}
                            className="flex items-center space-x-1 flex-1 sm:flex-none"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                            className="flex items-center space-x-1 text-destructive hover:text-destructive flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, ruleId: null })}
        onConfirm={confirmDelete}
        title="Excluir Regra"
        description="Tem certeza que deseja excluir esta regra de pontuação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
