import { prisma } from "../lib/prisma"

async function testPrismaConnection() {
  try {
    console.log("🔄 Testando conexão com o banco de dados...")

    // Teste básico de conexão
    await prisma.$connect()
    console.log("✅ Conexão com o banco estabelecida com sucesso!")

    // Teste de criação de tabelas (verificar se as migrations foram aplicadas)
    const adminCount = await prisma.admin.count()
    console.log(`📊 Admins no banco: ${adminCount}`)

    const participantCount = await prisma.participant.count()
    console.log(`👥 Participantes no banco: ${participantCount}`)

    const salesCount = await prisma.sale.count()
    console.log(`💰 Vendas no banco: ${salesCount}`)

    const rulesCount = await prisma.gameRule.count()
    console.log(`🎮 Regras do jogo no banco: ${rulesCount}`)

    const competitionsCount = await prisma.competition.count()
    console.log(`🏆 Competições no banco: ${competitionsCount}`)

    const achievementsCount = await prisma.achievement.count()
    console.log(`🏅 Conquistas no banco: ${achievementsCount}`)

    console.log("\n🎉 Teste de conexão concluído com sucesso!")
    console.log("📝 Próximos passos:")
    console.log("   1. Execute: npx prisma generate")
    console.log("   2. Execute: npx prisma db push")
    console.log("   3. Teste a aplicação")
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco:", error)
    console.log("\n🔧 Possíveis soluções:")
    console.log("   1. Verifique se a DATABASE_URL está configurada corretamente")
    console.log("   2. Execute: npx prisma generate")
    console.log("   3. Execute: npx prisma db push")
    console.log("   4. Verifique se o banco de dados está acessível")
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaConnection()
