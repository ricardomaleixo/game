"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getCompetitions,
  getParticipants,
  saveCompetition,
  updateCompetition,
  deleteCompetition,
  declareWinners, // Importando nova função
} from "@/app/actions/database-actions"
import type { Competition, Participant } from "@/lib/database"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Target, Trophy, Building, Zap, Edit, Trash2 } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

const competitionTypes = [
  { value: "tower", label: "Torre de Pontos", icon: Building, description: "Cada venda aumenta a torre visual" },
  { value: "race", label: "Corrida Virtual", icon: Zap, description: "Avatar avança em uma pista a cada venda" },
]

export function CompetitionsManager() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    competitionId: string | null
  }>({ isOpen: false, competitionId: null })
  const [winnersConfirmation, setWinnersConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as Competition["type"],
    startDate: new Date().toISOString().split("T")[0], // Data inicial padrão = HOJE
    endDate: "",
    selectedParticipants: [] as string[],
    isActive: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [competitionsData, participantsData] = await Promise.all([getCompetitions(), getParticipants()])
      setCompetitions(competitionsData)
      setParticipants(participantsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingCompetition) {
        await updateCompetition(editingCompetition.id, {
          name: formData.name,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate,
          participants: formData.selectedParticipants,
          isActive: formData.isActive,
        })
        setIsEditDialogOpen(false)
        setEditingCompetition(null)
      } else {
        if (formData.isActive) {
          // Desativar todas as gincanas ativas
          for (const comp of competitions) {
            if (comp.isActive) {
              await updateCompetition(comp.id, {
                ...comp,
                isActive: false,
              })
            }
          }
        }

        await saveCompetition({
          name: formData.name,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate,
          participants: formData.selectedParticipants,
          isActive: formData.isActive,
        })
        setIsDialogOpen(false)
      }

      setFormData({
        name: "",
        type: "" as Competition["type"],
        startDate: new Date().toISOString().split("T")[0], // Resetar para data de hoje
        endDate: "",
        selectedParticipants: [],
        isActive: true,
      })
      await loadData()
    } catch (error) {
      console.error("Erro ao salvar competição:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition)

    // Converter datas ISO para formato YYYY-MM-DD esperado pelo input date
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    setFormData({
      name: competition.name,
      type: competition.type,
      startDate: formatDateForInput(competition.startDate),
      endDate: formatDateForInput(competition.endDate),
      selectedParticipants: competition.participants,
      isActive: competition.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, competitionId: id })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.competitionId) {
      setIsLoading(true)
      try {
        await deleteCompetition(deleteConfirmation.competitionId)
        await loadData()
      } catch (error) {
        console.error("Erro ao deletar competição:", error)
      } finally {
        setIsLoading(false)
      }
    }
    setDeleteConfirmation({ isOpen: false, competitionId: null })
  }

  const declareWinnersHandler = () => {
    setWinnersConfirmation(true)
  }

  const confirmDeclareWinners = async () => {
    setIsLoading(true)
    try {
      await declareWinners()
      await loadData()
    } catch (error) {
      console.error("Erro ao declarar vencedores:", error)
      alert(error instanceof Error ? error.message : "Erro ao declarar vencedores")
    } finally {
      setIsLoading(false)
      setWinnersConfirmation(false)
    }
  }

  const handleParticipantToggle = (participantId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedParticipants: [...formData.selectedParticipants, participantId],
      })
    } else {
      setFormData({
        ...formData,
        selectedParticipants: formData.selectedParticipants.filter((id) => id !== participantId),
      })
    }
  }

  const getCompetitionTypeInfo = (type: Competition["type"]) => {
    return competitionTypes.find((t) => t.value === type)
  }

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.type !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== "" &&
      formData.selectedParticipants.length > 0
    )
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Gincana</Label>
        <Input
          id="name"
          placeholder="Ex: Gincana de Setembro 2024"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-lg">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
        />
        <div className="flex-1">
          <Label htmlFor="isActive" className="cursor-pointer font-medium">
            Gincana Ativa
          </Label>
          <p className="text-sm text-muted-foreground">
            Quando ativa, a gincana aparecerá para os participantes durante o período configurado
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Gincana</Label>
        <div className="grid grid-cols-1 gap-3">
          {competitionTypes.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === type.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setFormData({ ...formData, type: type.value as Competition["type"] })}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Participantes</Label>
        <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <Checkbox
                id={participant.id}
                checked={formData.selectedParticipants.includes(participant.id)}
                onCheckedChange={(checked) => handleParticipantToggle(participant.id, checked as boolean)}
              />
              <Label htmlFor={participant.id} className="flex-1 cursor-pointer">
                {participant.name} - {participant.position}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingCompetition(null)
            setFormData({
              name: "",
              type: "" as Competition["type"],
              startDate: new Date().toISOString().split("T")[0],
              endDate: "",
              selectedParticipants: [],
              isActive: true,
            })
          }}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !isFormValid()}>
          {isLoading ? "Salvando..." : editingCompetition ? "Atualizar Gincana" : "Criar Gincana"}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Gerenciar Gincanas</span>
              </CardTitle>
              <CardDescription>Crie e gerencie as competições gamificadas</CardDescription>
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    <span>Nova Gincana</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Criar Nova Gincana</span>
                    </DialogTitle>
                    <DialogDescription>Configure uma nova competição gamificada</DialogDescription>
                  </DialogHeader>
                  {renderForm()}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Nenhuma gincana criada ainda</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Crie uma gincana para começar a competição</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitions.map((competition) => {
                    const typeInfo = getCompetitionTypeInfo(competition.type)
                    const Icon = typeInfo?.icon || Target
                    return (
                      <TableRow
                        key={competition.id}
                        className="block sm:table-row border-b sm:border-b-0 p-3 sm:p-0 mb-3 sm:mb-0 bg-card rounded-lg sm:bg-transparent sm:rounded-none"
                      >
                        <TableCell className="block sm:table-cell font-medium">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Nome:</span>
                          {competition.name}
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Tipo:</span>
                          {typeInfo?.label}
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Período:</span>
                          <span className="text-sm">
                            {new Date(competition.startDate).toLocaleDateString("pt-BR")} -{" "}
                            {new Date(competition.endDate).toLocaleDateString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">
                            Participantes:
                          </span>
                          {competition.participants.length}
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Status:</span>
                          <Badge variant={competition.isActive ? "default" : "secondary"}>
                            {competition.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="block sm:table-cell">
                          <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Ações:</span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(competition)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sm:hidden ml-1">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(competition.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sm:hidden ml-1">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Editar Gincana</span>
            </DialogTitle>
            <DialogDescription>Edite as informações da competição gamificada</DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, competitionId: null })}
        onConfirm={confirmDelete}
        title="Excluir Gincana"
        description="Tem certeza que deseja excluir esta gincana? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={winnersConfirmation}
        onClose={() => setWinnersConfirmation(false)}
        onConfirm={confirmDeclareWinners}
        title="Declarar Vencedores"
        description="Ao declarar os vencedores, os 3 primeiros colocados receberão medalhas (ouro, prata e bronze), seus pontos serão salvos no histórico de conquistas, todos os pontos serão zerados e a gincana será encerrada. Deseja continuar?"
        confirmText="Declarar Vencedores"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  )
}
