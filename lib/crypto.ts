// Secure password hashing utility using bcrypt
const bcrypt = require('bcryptjs')

// Número de rounds do salt (10-12 é recomendado, 10 para desenvolvimento)
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Erro ao processar senha')
  }
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Se o hash parece ser SHA-256 (64 caracteres hex), migrar para bcrypt
    if (hashedPassword.length === 64 && /^[a-f0-9]+$/i.test(hashedPassword)) {
      console.log('Detectado hash SHA-256 legado, migrando para bcrypt...')
      
      // Verificar se a senha corresponde ao hash SHA-256 antigo
      const crypto = await import('crypto')
      const sha256Hash = crypto.createHash('sha256').update(password).digest('hex')
      
      if (sha256Hash === hashedPassword) {
        // Senha correta com hash antigo - retorna true para permitir login
        // O sistema deve atualizar para bcrypt no próximo login
        return true
      }
      return false
    }
    
    // Hash bcrypt normal
    const isValid = await bcrypt.compare(password, hashedPassword)
    return isValid
  } catch (error) {
    console.error('Error comparing password:', error)
    return false
  }
}

// Função para verificar se um hash é do formato antigo (SHA-256)
export function isLegacyHash(hash: string): boolean {
  return hash.length === 64 && /^[a-f0-9]+$/i.test(hash)
}
