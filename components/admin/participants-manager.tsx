"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  getCompetitions,
} from "@/app/actions/database-actions"
import type { Participant, Competition } from "@/lib/database"
import { authService } from "@/lib/auth"
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
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useToast } from "@/hooks/use-toast"

export function ParticipantsManager() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    participant: Participant | null
  }>({ isOpen: false, participant: null })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      setIsLoading(true)
      const [participantsData, competitionsData] = await Promise.all([getParticipants(), getCompetitions()])
      setParticipants(participantsData)
      setCompetitions(competitionsData)
    } catch (error) {
      console.error("[v0] Erro ao carregar participantes:", error)
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os participantes. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const authState = await authService.getAuthState()

      if (!authState.isAuthenticated) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para criar participantes.",
          variant: "destructive",
        })
        return
      }

      await createParticipant(formData)

      setFormData({ name: "", email: "", position: "" })
      setIsDialogOpen(false)

      toast({
        title: "Participante criado!",
        description: `${formData.name} foi adicionado com sucesso.`,
      })

      await loadParticipants()
    } catch (error: any) {
      console.error("[v0] ERRO no cadastro:", error)
      const errorMessage = error?.message || "Erro ao criar participante"
      toast({
        title: "Erro ao criar participante",
        description: errorMessage.includes("email") ? "Este email já está cadastrado." : errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setFormData({
      name: participant.name,
      email: participant.email,
      position: participant.position,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingParticipant) {
      try {
        await updateParticipant(editingParticipant.id, formData)
        setFormData({ name: "", email: "", position: "" })
        setIsEditDialogOpen(false)
        setEditingParticipant(null)
        toast({
          title: "Participante atualizado!",
          description: "As informações foram salvas com sucesso.",
        })
        await loadParticipants()
      } catch (error: any) {
        console.error("[v0] Erro ao atualizar participante:", error)
        toast({
          title: "Erro ao atualizar",
          description: error?.message || "Não foi possível atualizar o participante.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = (participant: Participant) => {
    setDeleteConfirmation({ isOpen: true, participant })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.participant) {
      try {
        await deleteParticipant(deleteConfirmation.participant.id)
        toast({
          title: "Participante excluído",
          description: `${deleteConfirmation.participant.name} foi removido do sistema.`,
        })
        await loadParticipants()
      } catch (error) {
        console.error("[v0] Erro ao deletar participante:", error)
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o participante.",
          variant: "destructive",
        })
      }
    }
    setDeleteConfirmation({ isOpen: false, participant: null })
  }

  const getActiveCompetitionName = (participantId: string) => {
    const activeCompetition = competitions.find((comp) => comp.isActive && comp.participants.includes(participantId))
    return activeCompetition ? activeCompetition.name : "-"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando participantes...</p>
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
                <span>👥</span>
                <span>Gerenciar Participantes</span>
              </CardTitle>
              <CardDescription>Cadastre e gerencie os vendedores que participarão das gincanas</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <span>➕</span>
                  <span>Novo Participante</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-2 sm:mx-0 max-w-md sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <span>👤</span>
                    <span>Cadastrar Participante</span>
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Adicione um novo vendedor ao sistema de gincanas
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm">
                      Função
                    </Label>
                    <Input
                      id="position"
                      placeholder="Ex: Vendedor, Consultor"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                      className="text-base sm:text-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl sm:text-6xl mb-4 block">👤</span>
              <p className="text-muted-foreground text-sm sm:text-base">Nenhum participante cadastrado ainda</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Clique em "Novo Participante" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Gincana</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow
                      key={participant.id}
                      className="block sm:table-row border-b sm:border-b-0 p-3 sm:p-0 mb-3 sm:mb-0 bg-card rounded-lg sm:bg-transparent sm:rounded-none"
                    >
                      <TableCell className="block sm:table-cell font-medium text-base sm:text-sm">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Nome:</span>
                        {participant.name}
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Email:</span>
                        <span className="text-sm break-all">{participant.email}</span>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Função:</span>
                        {participant.position}
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Gincana:</span>
                        <span className="text-sm">{getActiveCompetitionName(participant.id)}</span>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Pontos:</span>
                        <div className="flex items-center space-x-2">
                          <span>🏆</span>
                          <span className="font-semibold">{participant.points}</span>
                        </div>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Status:</span>
                        <Badge variant="secondary">Ativo</Badge>
                      </TableCell>
                      <TableCell className="block sm:table-cell">
                        <span className="sm:hidden font-semibold text-muted-foreground block mb-1">Ações:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(participant)}
                            className="flex-1 sm:flex-none"
                          >
                            <span className="sm:hidden mr-1">Editar</span>
                            ✏️
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(participant)}
                            className="flex-1 sm:flex-none"
                          >
                            <span className="sm:hidden mr-1">Excluir</span>
                            🗑️
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="mx-2 sm:mx-0 max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <span>✏️</span>
              <span>Editar Participante</span>
            </DialogTitle>
            <DialogDescription className="text-sm">Edite as informações do participante</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm">
                Nome Completo
              </Label>
              <Input
                id="edit-name"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="joao@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position" className="text-sm">
                Função
              </Label>
              <Input
                id="edit-position"
                placeholder="Ex: Vendedor, Consultor"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
                className="text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, participant: null })}
        onConfirm={confirmDelete}
        title="Excluir Participante"
        description={`Tem certeza que deseja excluir ${deleteConfirmation.participant?.name}? Esta ação não pode ser desfeita e removerá todas as vendas associadas.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
