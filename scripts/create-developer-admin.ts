import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

// Script para criar usuário admin específico
async function createDeveloperAdmin() {
  console.log("🔄 Criando usuário admin desenvolvedor...")
  
  try {
    const email = "ricardoaleixoo@gmail.com"
    const password = "Nova!@#"
    const name = "Ricardo Aleixo"
    
    // Verificar se já existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log("ℹ️  Admin desenvolvedor já existe com ID:", existingAdmin.id)
      console.log("📧 Email:", existingAdmin.email)
      console.log("👤 Nome:", existingAdmin.name)
      return existingAdmin
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Criar admin com ID específico para desenvolvimento
    const newAdmin = await prisma.admin.create({
      data: {
        id: "developer-admin-id", // ID fixo para desenvolvimento
        name,
        email,
        password: hashedPassword
      }
    })
    
    console.log("✅ Admin desenvolvedor criado com sucesso!")
    console.log("🆔 ID:", newAdmin.id)
    console.log("📧 Email:", newAdmin.email)
    console.log("👤 Nome:", newAdmin.name)
    console.log("📅 Criado em:", newAdmin.createdAt.toISOString())
    
    return newAdmin
    
  } catch (error) {
    console.error("❌ Erro ao criar admin desenvolvedor:", error)
    throw error
  }
}

// Função para também garantir admin padrão
async function ensureDefaultAdmin() {
  console.log("🔄 Verificando admin padrão...")
  
  try {
    const defaultEmail = "admin@empresa.com"
    const defaultPassword = "admin123"
    const defaultName = "Administrador"
    
    const existingDefault = await prisma.admin.findUnique({
      where: { email: defaultEmail }
    })
    
    if (!existingDefault) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)
      
      const defaultAdmin = await prisma.admin.create({
        data: {
          name: defaultName,
          email: defaultEmail,
          password: hashedPassword
        }
      })
      
      console.log("✅ Admin padrão criado com ID:", defaultAdmin.id)
    } else {
      console.log("ℹ️  Admin padrão já existe com ID:", existingDefault.id)
    }
    
  } catch (error) {
    console.error("❌ Erro ao criar admin padrão:", error)
  }
}

// Função para listar todos os admins
async function listAllAdmins() {
  console.log("\n📋 Lista de todos os admins:")
  
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })
    
    if (admins.length === 0) {
      console.log("❌ Nenhum admin encontrado")
      return
    }
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`)
      console.log(`   🆔 ID: ${admin.id}`)
      console.log(`   📧 Email: ${admin.email}`)
      console.log(`   📅 Criado: ${admin.createdAt.toLocaleDateString('pt-BR')}`)
    })
    
  } catch (error) {
    console.error("❌ Erro ao listar admins:", error)
  }
}

// Função principal
async function main() {
  try {
    console.log("🚀 Iniciando criação de admin desenvolvedor...\n")
    
    // Criar admin desenvolvedor
    await createDeveloperAdmin()
    
    // Garantir admin padrão também existe
    await ensureDefaultAdmin()
    
    // Listar todos os admins
    await listAllAdmins()
    
    console.log("\n🎉 Processo concluído com sucesso!")
    console.log("\n📝 Informações para login:")
    console.log("Email: desenvolvedor@game.com")
    console.log("Senha: desenvolvedor!@#")
    
  } catch (error) {
    console.error("❌ Erro no processo:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

export { createDeveloperAdmin, ensureDefaultAdmin, listAllAdmins }