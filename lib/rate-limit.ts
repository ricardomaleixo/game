// Rate limiting utility para proteger Server Actions
type RateLimitStore = Map<string, { count: number; resetAt: number }>

const stores: Map<string, RateLimitStore> = new Map()

interface RateLimitConfig {
  interval: number // Intervalo em milissegundos
  maxRequests: number // Número máximo de requisições no intervalo
}

// Configurações padrão para diferentes tipos de ações
export const RATE_LIMITS = {
  login: { interval: 60 * 1000, maxRequests: 5 }, // 5 tentativas por minuto
  register: { interval: 60 * 1000, maxRequests: 3 }, // 3 registros por minuto
  passwordReset: { interval: 60 * 1000, maxRequests: 3 }, // 3 resets por minuto
  default: { interval: 60 * 1000, maxRequests: 30 }, // 30 requisições por minuto
} as const

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RateLimitError"
  }
}

/**
 * Verifica se uma requisição está dentro do limite de taxa
 * @param identifier - Identificador único (ex: email, IP, userId)
 * @param action - Tipo de ação sendo executada
 * @param config - Configuração customizada de rate limit
 * @returns true se permitido, lança erro se excedido
 */
export function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMITS = "default",
  config?: RateLimitConfig,
): boolean {
  const limitConfig = config || RATE_LIMITS[action]

  // Obter ou criar store para esta ação
  if (!stores.has(action)) {
    stores.set(action, new Map())
  }
  const store = stores.get(action)!

  const now = Date.now()
  const record = store.get(identifier)

  // Se não existe registro ou o intervalo expirou, criar novo
  if (!record || now > record.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + limitConfig.interval,
    })
    return true
  }

  // Se ainda está dentro do intervalo, verificar contagem
  if (record.count >= limitConfig.maxRequests) {
    const remainingTime = Math.ceil((record.resetAt - now) / 1000)
    throw new RateLimitError(`Muitas tentativas. Tente novamente em ${remainingTime} segundos.`)
  }

  // Incrementar contagem
  record.count++
  return true
}

/**
 * Limpa registros expirados periodicamente
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()

  stores.forEach((store) => {
    store.forEach((record, key) => {
      if (now > record.resetAt) {
        store.delete(key)
      }
    })
  })
}

// Executar limpeza a cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000)
}
