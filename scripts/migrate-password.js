#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🚀 Executando migração para adicionar campo de senha...')

try {
  // Gerar o cliente Prisma primeiro
  console.log('📦 Gerando cliente Prisma...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  
  // Executar a migração
  console.log('🏗️  Executando migração...')
  execSync('npx prisma migrate dev --name add_participant_password', { stdio: 'inherit' })
  
  console.log('✅ Migração executada com sucesso!')
  console.log('🔧 Agora os participantes podem definir senhas no primeiro acesso')
  
} catch (error) {
  console.error('❌ Erro durante a migração:', error.message)
  process.exit(1)
}