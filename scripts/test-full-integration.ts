import { prismaDb } from "../lib/database-prisma"
import { prisma } from "../lib/prisma"

async function testFullIntegration() {
  console.log("🧪 Testando integração completa do Prisma...")

  try {
    // 1. Testar conexão
    console.log("1. Testando conexão com banco...")
    await prisma.$connect()
    console.log("✅ Conexão estabelecida com sucesso!")

    // 2. Verificar tabelas
    console.log("\n2. Verificando estrutura das tabelas...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("📋 Tabelas encontradas:", tables)

    // 3. Testar operações CRUD básicas
    console.log("\n3. Testando operações CRUD...")

    // Simular login de admin para os testes
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "gamified-sales-auth",
        JSON.stringify({
          id: "test-admin-id",
          role: "admin",
          email: "admin@test.com",
        }),
      )
    }

    // Testar participantes
    console.log("   - Testando participantes...")
    const participants = await prismaDb.getParticipants()
    console.log(`   ✅ ${participants.length} participantes encontrados`)

    // Testar regras do jogo
    console.log("   - Testando regras do jogo...")
    const gameRules = await prismaDb.getGameRules()
    console.log(`   ✅ ${gameRules.length} regras encontradas`)

    // Testar vendas
    console.log("   - Testando vendas...")
    const sales = await prismaDb.getSales()
    console.log(`   ✅ ${sales.length} vendas encontradas`)

    // Testar competições
    console.log("   - Testando competições...")
    const competitions = await prismaDb.getCompetitions()
    console.log(`   ✅ ${competitions.length} competições encontradas`)

    // Testar conquistas
    console.log("   - Testando conquistas...")
    const achievements = await prismaDb.getAchievements()
    console.log(`   ✅ ${achievements.length} conquistas encontradas`)

    console.log("\n🎉 Todos os testes passaram! Integração com Prisma funcionando perfeitamente!")
  } catch (error) {
    console.error("❌ Erro durante os testes:", error)

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        console.log("\n💡 Dica: Verifique se a DATABASE_URL está configurada corretamente no arquivo .env.local")
      } else if (error.message.includes("relation") || error.message.includes("table")) {
        console.log("\n💡 Dica: Execute 'npx prisma db push' para criar as tabelas no banco")
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Executar testes
testFullIntegration()
