import { prisma } from "../lib/prisma"

async function verifySetup() {
  try {
    console.log("🔍 Verificando conexão com o banco de dados...")

    // Teste de conexão
    await prisma.$connect()
    console.log("✅ Conexão estabelecida com sucesso!")

    // Verificar se as tabelas foram criadas
    console.log("\n📋 Verificando tabelas criadas...")

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    console.log("Tabelas encontradas:", tables)

    // Contar registros em cada tabela
    console.log("\n📊 Contando registros...")

    const adminCount = await prisma.admin.count()
    const participantCount = await prisma.participant.count()
    const saleCount = await prisma.sale.count()
    const gameRuleCount = await prisma.gameRule.count()
    const competitionCount = await prisma.competition.count()
    const achievementCount = await prisma.achievement.count()

    console.log(`Admins: ${adminCount}`)
    console.log(`Participantes: ${participantCount}`)
    console.log(`Vendas: ${saleCount}`)
    console.log(`Regras do Jogo: ${gameRuleCount}`)
    console.log(`Competições: ${competitionCount}`)
    console.log(`Conquistas: ${achievementCount}`)

    console.log("\n🎉 Setup do Prisma verificado com sucesso!")
  } catch (error) {
    console.error("❌ Erro na verificação:", error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySetup()
