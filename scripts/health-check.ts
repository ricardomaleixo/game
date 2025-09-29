import { prisma } from "../lib/prisma"
import { prismaDb } from "../lib/database-prisma"

async function healthCheck() {
  console.log("🏥 Verificação de Saúde do Sistema Prisma")
  console.log("=".repeat(50))

  const checks = []

  try {
    // 1. Conexão com banco
    console.log("1. Testando conexão com banco...")
    await prisma.$connect()
    checks.push({ name: "Conexão", status: "✅ OK" })

    // 2. Verificar se tabelas existem
    console.log("2. Verificando tabelas...")
    const adminCount = await prisma.admin.count()
    const participantCount = await prisma.participant.count()
    const saleCount = await prisma.sale.count()
    const gameRuleCount = await prisma.gameRule.count()
    const competitionCount = await prisma.competition.count()
    const achievementCount = await prisma.achievement.count()

    checks.push({
      name: "Tabelas",
      status: "✅ OK",
      details: `Admin: ${adminCount}, Participants: ${participantCount}, Sales: ${saleCount}, Rules: ${gameRuleCount}, Competitions: ${competitionCount}, Achievements: ${achievementCount}`,
    })

    // 3. Testar operações básicas
    console.log("3. Testando operações básicas...")

    // Simular contexto de admin
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "gamified-sales-auth",
        JSON.stringify({
          id: "health-check-admin",
          role: "admin",
          email: "healthcheck@test.com",
        }),
      )
    }

    const participants = await prismaDb.getParticipants()
    const sales = await prismaDb.getSales()
    const gameRules = await prismaDb.getGameRules()
    const competitions = await prismaDb.getCompetitions()
    const achievements = await prismaDb.getAchievements()

    checks.push({
      name: "Operações CRUD",
      status: "✅ OK",
      details: `Leitura de dados funcionando`,
    })

    // 4. Verificar integridade referencial
    console.log("4. Verificando integridade referencial...")
    const orphanSales = await prisma.sale.count({
      where: {
        participant: null,
      },
    })

    checks.push({
      name: "Integridade",
      status: orphanSales === 0 ? "✅ OK" : "⚠️ ATENÇÃO",
      details: orphanSales > 0 ? `${orphanSales} vendas órfãs encontradas` : "Sem problemas de integridade",
    })
  } catch (error) {
    checks.push({
      name: "Erro Geral",
      status: "❌ FALHA",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  } finally {
    await prisma.$disconnect()
  }

  // Relatório final
  console.log("\n📊 RELATÓRIO DE SAÚDE")
  console.log("=".repeat(50))

  checks.forEach((check) => {
    console.log(`${check.status} ${check.name}`)
    if (check.details) {
      console.log(`   ${check.details}`)
    }
  })

  const allOk = checks.every((check) => check.status.includes("✅"))

  console.log("\n" + "=".repeat(50))
  if (allOk) {
    console.log("🎉 SISTEMA SAUDÁVEL - Prisma funcionando perfeitamente!")
  } else {
    console.log("⚠️ ATENÇÃO NECESSÁRIA - Verifique os itens marcados acima")
  }
}

// Executar verificação
healthCheck()
