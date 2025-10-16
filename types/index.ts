import type { Participant, Competition, GameRule, Sale, Achievement } from "@prisma/client"

// Interfaces para dados formatados retornados pelas actions
export interface FormattedParticipant {
  id: string
  name: string
  email: string
  position: string
  points: number
  createdAt: string
  adminId: string
}

export interface FormattedCompetition {
  id: string
  name: string
  type: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate: string
  endDate: string
  isActive: boolean
  rules: any
  participants: string[]
  adminId: string
}

export interface FormattedGameRule {
  id: string
  productName: string
  points: number
  isActive: boolean
  adminId: string
}

export interface FormattedSale {
  id: string
  participantId: string
  productName: string
  points: number
  date: string
  type: "sale" | "rental"
  adminId: string
}

export interface FormattedAchievement {
  id: string
  participantId: string
  competitionId: string
  type: "gold" | "silver" | "bronze" | "treasure" | "mission"
  description: string
  points: number
  date: string
  adminId: string
}

// Interfaces para criação de dados
export interface CreateParticipant {
  name: string
  email: string
  position: string
}

export interface CreateCompetition {
  name: string
  type: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate: string
  endDate: string
  isActive: boolean
  rules?: any
  participants: string[]
}

export interface CreateGameRule {
  productName: string
  points: number
}

export interface CreateSale {
  participantId: string
  productName: string
  points: number
  type: "sale" | "rental"
  date?: string
}

export interface CreateAchievement {
  participantId: string
  competitionId?: string
  type: "gold" | "silver" | "bronze" | "treasure" | "mission"
  description: string
  points: number
}

// Interfaces para atualizações
export interface UpdateParticipant {
  name?: string
  email?: string
  position?: string
  points?: number
}

export interface UpdateCompetition {
  name?: string
  type?: "tower" | "race" | "treasure" | "medals" | "missions"
  startDate?: string
  endDate?: string
  isActive?: boolean
  rules?: any
  participants?: string[]
}

export interface UpdateSale {
  participantId?: string
  productName?: string
  points?: number
  date?: string
  type?: "sale" | "rental"
}

export interface UpdateGameRule {
  productName?: string
  points?: number
  isActive?: boolean
}

// Interface para autenticação
export interface AuthUser {
  id: string
  email: string
  role: "admin" | "participant"
  adminId?: string
}

// Interface para relatórios
export interface ReportData {
  participants: Array<FormattedParticipant & {
    rankingPosition: number
    salesCount: number
    revenue: number
    averageTicket: number
    achievements: number
  }>
  summary: {
    totalParticipants: number
    totalSales: number
    totalRevenue: number
    averageTicket: number
    topPerformer: string
  }
}

// Interface para componentes de jogos
export interface GameProps {
  competition: FormattedCompetition
  participant: FormattedParticipant
}

// Interface para filtros
export interface ParticipantFilters {
  search?: string
  position?: string
  minPoints?: number
  maxPoints?: number
}

export interface SaleFilters {
  participantId?: string
  productName?: string
  type?: "sale" | "rental"
  dateFrom?: string
  dateTo?: string
}

export interface CompetitionFilters {
  type?: "tower" | "race" | "treasure" | "medals" | "missions"
  isActive?: boolean
  dateFrom?: string
  dateTo?: string
}

// Interface para dashboard stats
export interface DashboardStats {
  totalParticipants: number
  totalSales: number
  totalPoints: number
  activeCompetitions: number
  topPerformer: FormattedParticipant | null
  recentSales: FormattedSale[]
  recentAchievements: FormattedAchievement[]
}

// Interface para ranking
export interface RankingEntry {
  id: string
  name: string
  email: string
  position: string // job position
  points: number
  createdAt: string
  adminId: string
  rankingPosition: number // ranking position
  progress: number
  trend: "up" | "down" | "stable"
}

// Interface para notificações
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Tipos utilitários
export type CompetitionType = "tower" | "race" | "treasure" | "medals" | "missions"
export type SaleType = "sale" | "rental"
export type AchievementType = "gold" | "silver" | "bronze" | "treasure" | "mission"
export type UserRole = "admin" | "participant"

// Interface para context
export interface AppContextType {
  user: AuthUser | null
  loading: boolean
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
}

// Interface para form data
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
}

// Interface para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Interface para pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}