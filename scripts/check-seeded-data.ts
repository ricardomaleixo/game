import { prisma } from "../lib/prisma"

async function checkSeededData() {
  try {
    console.log("🔍 Verificando dados inseridos no banco...\n")

    // Verificar admins
    const admins = await prisma.admin.findMany()
    console.log(`👤 Admins encontrados: ${admins.length}`)
    admins.forEach((admin) => {
      console.log(`  - ${admin.name} (${admin.email})`)
    })

    // Verificar participantes
    const participants = await prisma.participant.findMany()
    console.log(`\n👥 Participantes encontrados: ${participants.length}`)
    participants.forEach((participant) => {
      console.log(`  - ${participant.name} (${participant.email}) - Pontos: ${participant.points}`)
    })

    // Verificar vendas
    const sales = await prisma.sale.findMany({
      include: {
        participant: true,
      },
    })
    console.log(`\n💰 Vendas encontradas: ${sales.length}`)
    sales.forEach((sale) => {
      console.log(`  - ${sale.productName} - R$ ${sale.value} - ${sale.participant.name}`)
    })

    // Verificar regras do jogo
    const gameRules = await prisma.gameRule.findMany()
    console.log(`\n🎮 Regras do jogo: ${gameRules.length}`)
    gameRules.forEach((rule) => {
      console.log(`  - ${rule.name}: ${rule.points} pontos`)
    })

    // Verificar conquistas
    const achievements = await prisma.achievement.findMany()
    console.log(`\n🏆 Conquistas disponíveis: ${achievements.length}`)
    achievements.forEach((achievement) => {
      console.log(`  - ${achievement.name} (${achievement.points} pontos)`)
    })

    console.log("\n✅ Verificação concluída com sucesso!")
  } catch (error) {
    console.error("❌ Erro ao verificar dados:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSeededData()
