import type { 
  CreateParticipant, 
  CreateCompetition, 
  CreateGameRule, 
  CreateSale,
  UpdateParticipant,
  CompetitionType,
  SaleType 
} from "@/types"

// Validações para criação de participantes
export function validateParticipant(data: CreateParticipant): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres")
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Email deve ser válido")
  }

  if (!data.position || data.position.trim().length < 2) {
    errors.push("Posição deve ter pelo menos 2 caracteres")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validações para criação de competições
export function validateCompetition(data: CreateCompetition): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Nome da competição deve ter pelo menos 2 caracteres")
  }

  if (!data.type || !isValidCompetitionType(data.type)) {
    errors.push("Tipo de competição deve ser válido")
  }

  if (!data.startDate) {
    errors.push("Data de início é obrigatória")
  }

  if (!data.endDate) {
    errors.push("Data de fim é obrigatória")
  }

  if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push("Data de início deve ser anterior à data de fim")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validações para criação de regras de jogo
export function validateGameRule(data: CreateGameRule): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.productName || data.productName.trim().length < 2) {
    errors.push("Nome do produto deve ter pelo menos 2 caracteres")
  }

  if (!data.points || data.points <= 0) {
    errors.push("Pontos devem ser maior que zero")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validações para criação de vendas
export function validateSale(data: CreateSale): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.participantId) {
    errors.push("Participante é obrigatório")
  }

  if (!data.productName || data.productName.trim().length < 2) {
    errors.push("Nome do produto é obrigatório")
  }

  if (!data.points || data.points <= 0) {
    errors.push("Pontos devem ser maior que zero")
  }

  if (!data.type || !isValidSaleType(data.type)) {
    errors.push("Tipo de venda deve ser válido")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validações para atualização de participantes
export function validateParticipantUpdate(data: UpdateParticipant): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
    errors.push("Nome deve ter pelo menos 2 caracteres")
  }

  if (data.email !== undefined && (!data.email || !isValidEmail(data.email))) {
    errors.push("Email deve ser válido")
  }

  if (data.position !== undefined && (!data.position || data.position.trim().length < 2)) {
    errors.push("Posição deve ter pelo menos 2 caracteres")
  }

  if (data.points !== undefined && data.points < 0) {
    errors.push("Pontos não podem ser negativos")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helpers de validação
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidCompetitionType(type: string): type is CompetitionType {
  return ["tower", "race", "treasure", "medals", "missions"].includes(type)
}

export function isValidSaleType(type: string): type is SaleType {
  return ["sale", "rental"].includes(type)
}

// Formatadores
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR")
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("pt-BR")
}

export function formatPoints(points: number): string {
  return `${points} pts`
}

// Calculadoras
export function calculateAverageTicket(totalRevenue: number, totalSales: number): number {
  if (totalSales === 0) return 0
  return totalRevenue / totalSales
}

export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Geradores de ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Ordenadores
export function sortParticipantsByPoints(participants: any[], ascending = false) {
  return [...participants].sort((a, b) => {
    const multiplier = ascending ? 1 : -1
    return (a.points - b.points) * multiplier
  })
}

export function sortByDate(items: any[], dateField = 'date', ascending = false) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime()
    const dateB = new Date(b[dateField]).getTime()
    const multiplier = ascending ? 1 : -1
    return (dateA - dateB) * multiplier
  })
}

// Filtros
export function filterParticipantsBySearch(participants: any[], search: string) {
  if (!search) return participants
  
  const searchLower = search.toLowerCase()
  return participants.filter(p => 
    p.name.toLowerCase().includes(searchLower) ||
    p.email.toLowerCase().includes(searchLower) ||
    p.position.toLowerCase().includes(searchLower)
  )
}

export function filterSalesByDateRange(sales: any[], startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return sales
  
  return sales.filter(sale => {
    const saleDate = new Date(sale.date)
    
    if (startDate && saleDate < new Date(startDate)) return false
    if (endDate && saleDate > new Date(endDate)) return false
    
    return true
  })
}

// Agregadores
export function aggregateSalesByParticipant(sales: any[]) {
  const aggregated = sales.reduce((acc, sale) => {
    if (!acc[sale.participantId]) {
      acc[sale.participantId] = {
        participantId: sale.participantId,
        totalSales: 0,
        totalPoints: 0,
        salesCount: 0
      }
    }
    
    acc[sale.participantId].totalSales += sale.points // Assumindo que points representa valor
    acc[sale.participantId].totalPoints += sale.points
    acc[sale.participantId].salesCount += 1
    
    return acc
  }, {})
  
  return Object.values(aggregated)
}

export function aggregatePointsByPeriod(sales: any[], period: 'day' | 'week' | 'month' = 'day') {
  const aggregated = sales.reduce((acc, sale) => {
    const date = new Date(sale.date)
    let key: string
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        totalPoints: 0,
        salesCount: 0
      }
    }
    
    acc[key].totalPoints += sale.points
    acc[key].salesCount += 1
    
    return acc
  }, {})
  
  return Object.values(aggregated)
}

// Constantes utilitárias
export const COMPETITION_TYPES = {
  tower: "Torre de Pontos",
  race: "Corrida de Vendas",
  treasure: "Caça ao Tesouro",
  medals: "Coletor de Medalhas", 
  missions: "Missões Especiais"
} as const

export const SALE_TYPES = {
  sale: "Venda",
  rental: "Locação"
} as const

export const ACHIEVEMENT_TYPES = {
  gold: "Ouro",
  silver: "Prata", 
  bronze: "Bronze",
  treasure: "Tesouro",
  mission: "Missão"
} as const

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Você não tem permissão para realizar esta ação",
  NOT_FOUND: "Recurso não encontrado",
  VALIDATION_ERROR: "Dados inválidos fornecidos",
  SERVER_ERROR: "Erro interno do servidor",
  NETWORK_ERROR: "Erro de conexão",
  DUPLICATE_EMAIL: "Este email já está em uso",
  INVALID_CREDENTIALS: "Credenciais inválidas",
  SESSION_EXPIRED: "Sua sessão expirou"
} as const