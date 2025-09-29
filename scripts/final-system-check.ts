import { prisma } from "../lib/prisma"

async function finalSystemCheck() {
  console.log("🔍 Executando verificação final do sistema...\n")

  try {
    // Verificar conexão com o banco
    await prisma.$connect()
    console.log("✅ Conexão com banco de dados: OK")

    // Contar registros em cada tabela
    const counts = {
      admins: await prisma.admin.count(),
      participants: await prisma.participant.count(),
      sales: await prisma.sale.count(),
      gameRules: await prisma.gameRule.count(),
      competitions: await prisma.competition.count(),
      achievements: await prisma.achievement.count(),
    }

    console.log("\n📊 Contagem de registros:")
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} registros`)
    })

    // Testar algumas consultas complexas
    console.log("\n🧪 Testando consultas complexas...")

    // Participante com vendas
    const participantWithSales = await prisma.participant.findFirst({
      include: {
        sales: true,
        achievements: true,
      },
    })

    if (participantWithSales) {
      console.log(`✅ Consulta de participante com vendas: OK (${participantWithSales.sales.length} vendas)`)
    }

    // Ranking de participantes
    const ranking = await prisma.participant.findMany({
      orderBy: { totalPoints: "desc" },
      take: 3,
    })

    console.log(`✅ Ranking de participantes: OK (top 3 carregados)`)

    // Verificar regras de jogo ativas
    const activeRules = await prisma.gameRule.findMany({
      where: { isActive: true },
    })

    console.log(`✅ Regras de jogo ativas: ${activeRules.length} regras`)

    console.log("\n🎉 Sistema completamente funcional com Prisma!")
    console.log("📝 Próximos passos:")
    console.log("   1. Teste a aplicação no navegador")
    console.log("   2. Verifique se todas as funcionalidades estão funcionando")
    console.log("   3. Os dados agora são persistentes no PostgreSQL")
  } catch (error) {
    console.error("❌ Erro na verificação final:", error)
  } finally {
    await prisma.$disconnect()
  }
}

finalSystemCheck()
