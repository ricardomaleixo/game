import { prisma } from "../lib/prisma"

// Script para migrar dados do localStorage para o Prisma
// Execute este script após configurar o banco

async function migrateData() {
  try {
    console.log("Iniciando migração de dados...")

    // Verificar conexão
    await prisma.$connect()
    console.log("✅ Conectado ao banco de dados")

    // Aqui você pode adicionar lógica para migrar dados existentes
    // do localStorage para o banco de dados

    console.log("✅ Migração concluída com sucesso!")
  } catch (error) {
    console.error("❌ Erro na migração:", error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
