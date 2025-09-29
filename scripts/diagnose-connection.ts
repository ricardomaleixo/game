import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function diagnoseConnection() {
  console.log("🔍 Diagnosticando conexão com o banco de dados...\n")

  try {
    // Teste 1: Verificar se consegue conectar
    console.log("1. Testando conexão básica...")
    await prisma.$connect()
    console.log("✅ Conexão estabelecida com sucesso!\n")

    // Teste 2: Verificar se as tabelas existem
    console.log("2. Verificando se as tabelas existem...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("📋 Tabelas encontradas:", tables)
    console.log("")

    // Teste 3: Contar registros em cada tabela
    console.log("3. Contando registros...")
    const adminCount = await prisma.admin.count()
    const participantCount = await prisma.participant.count()
    const saleCount = await prisma.sale.count()
    const gameRuleCount = await prisma.gameRule.count()

    console.log(`👥 Admins: ${adminCount}`)
    console.log(`🎯 Participantes: ${participantCount}`)
    console.log(`💰 Vendas: ${saleCount}`)
    console.log(`🎮 Regras: ${gameRuleCount}`)
    console.log("")

    // Teste 4: Verificar se consegue buscar dados
    console.log("4. Testando busca de dados...")
    const participants = await prisma.participant.findMany({
      take: 3,
      include: {
        sales: true,
      },
    })

    console.log(`✅ Conseguiu buscar ${participants.length} participantes`)
    participants.forEach((p) => {
      console.log(`  - ${p.name}: ${p.sales.length} vendas, ${p.points} pontos`)
    })

    console.log("\n🎉 Diagnóstico concluído - Tudo funcionando!")
  } catch (error) {
    console.error("❌ Erro durante o diagnóstico:")
    console.error(error)

    if (error.message.includes("Environment variable not found")) {
      console.log("\n💡 Solução: Verifique se a DATABASE_URL está configurada no arquivo .env.local")
    }

    if (error.message.includes("connect ECONNREFUSED")) {
      console.log("\n💡 Solução: Verifique se o banco de dados está rodando e a URL está correta")
    }

    if (error.message.includes("does not exist")) {
      console.log('\n💡 Solução: Execute "npx prisma db push" para criar as tabelas')
    }
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseConnection()
