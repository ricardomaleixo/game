// Configurações da aplicação
export const APP_CONFIG = {
  name: "Sistema de Gincanas",
  version: "1.0.0",
  description: "Sistema gamificado para gestão de vendas e competições",
  author: "Sua Empresa",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const

// Configurações do banco de dados
export const DATABASE_CONFIG = {
  maxConnections: 100,
  connectionTimeout: 30000,
  queryTimeout: 60000,
} as const

// Configurações de paginação
export const PAGINATION_CONFIG = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
} as const

// Configurações de autenticação
export const AUTH_CONFIG = {
  sessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 dias em ms
  cookieName: "auth-token",
  redirectAfterLogin: "/dashboard",
  redirectAfterLogout: "/login",
} as const

// Configurações das competições
export const COMPETITION_CONFIG = {
  maxParticipants: 100,
  minDuration: 1, // dias
  maxDuration: 365, // dias
  defaultPointsPerSale: 10,
  pointsPerFloor: 10, // para torre
} as const

// Configurações de pontuação
export const POINTS_CONFIG = {
  minimumPoints: 1,
  maximumPoints: 1000,
  defaultSalePoints: 10,
  defaultRentalPoints: 5,
  bonusMultiplier: 1.5,
} as const

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
  maxNotifications: 50,
  autoRemoveSuccess: true,
  autoRemoveTimeout: 5000, // ms
  maxDisplayed: 5,
} as const

// Configurações de validação
export const VALIDATION_CONFIG = {
  minNameLength: 2,
  maxNameLength: 100,
  minEmailLength: 5,
  maxEmailLength: 254,
  minPasswordLength: 6,
  maxPasswordLength: 128,
  minProductNameLength: 2,
  maxProductNameLength: 200,
} as const

// Configurações de formatação
export const FORMAT_CONFIG = {
  currency: "BRL",
  locale: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "HH:mm",
  dateTimeFormat: "dd/MM/yyyy HH:mm",
} as const

// Configurações de arquivos
export const FILE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedDocumentTypes: ["application/pdf", "text/csv"],
  uploadPath: "/uploads",
} as const

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  debounceTimeout: 300, // ms
  throttleTimeout: 1000, // ms
  maxRetries: 3,
} as const

// Configurações de SEO
export const SEO_CONFIG = {
  defaultTitle: "Sistema de Gincanas",
  titleTemplate: "%s | Sistema de Gincanas",
  defaultDescription: "Sistema gamificado para gestão de vendas e competições",
  keywords: ["gincana", "vendas", "gamificação", "competição", "pontos"],
  ogImage: "/og-image.png",
} as const

// Configurações de tema
export const THEME_CONFIG = {
  defaultTheme: "light",
  themes: ["light", "dark"],
  primaryColor: "blue",
  fontFamily: "Inter",
} as const

// URLs da API
export const API_ENDPOINTS = {
  participants: "/api/participants",
  competitions: "/api/competitions",
  sales: "/api/sales",
  rules: "/api/rules",
  achievements: "/api/achievements",
  reports: "/api/reports",
  auth: "/api/auth",
} as const

// Rotas da aplicação
export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  admin: "/admin",
  participant: "/participant",
  reports: "/reports",
  settings: "/settings",
  profile: "/profile",
} as const

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Mensagens de erro
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
  SERVER_ERROR: "Erro interno do servidor. Tente novamente.",
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos.",
  UNAUTHORIZED: "Acesso negado. Faça login novamente.",
  NOT_FOUND: "Recurso não encontrado.",
  FORBIDDEN: "Você não tem permissão para esta ação.",
  DUPLICATE_EMAIL: "Este email já está em uso.",
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",
  FILE_TOO_LARGE: "Arquivo muito grande. Máximo permitido: 5MB.",
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido.",
} as const

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CREATED: "Criado com sucesso!",
  UPDATED: "Atualizado com sucesso!",
  DELETED: "Excluído com sucesso!",
  SAVED: "Salvo com sucesso!",
  LOGIN: "Login realizado com sucesso!",
  LOGOUT: "Logout realizado com sucesso!",
  EMAIL_SENT: "Email enviado com sucesso!",
  PASSWORD_RESET: "Senha redefinida com sucesso!",
  FILE_UPLOADED: "Arquivo enviado com sucesso!",
} as const

// Configurações de ambiente
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
} as const

// Configurações de logs
export const LOG_CONFIG = {
  level: ENV_CONFIG.isDevelopment ? "debug" : "info",
  enableConsole: ENV_CONFIG.isDevelopment,
  enableFile: ENV_CONFIG.isProduction,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
} as const

// Configurações de cache
export const CACHE_CONFIG = {
  participants: 5 * 60 * 1000, // 5 minutos
  competitions: 10 * 60 * 1000, // 10 minutos
  rules: 15 * 60 * 1000, // 15 minutos
  reports: 30 * 60 * 1000, // 30 minutos
} as const

// Configurações de rate limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // máximo de requests por window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
} as const
