import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkTables() {
  try {
    console.log("🔍 Verificando tabelas no banco de dados...\n")

    // Verificar cada tabela
    const tables = [
      { name: "admins", model: prisma.admin },
      { name: "participants", model: prisma.participant },
      { name: "sales", model: prisma.sale },
      { name: "game_rules", model: prisma.gameRule },
      { name: "competitions", model: prisma.competition },
      { name: "achievements", model: prisma.achievement },
    ]

    for (const table of tables) {
      try {
        const count = await table.model.count()
        console.log(`✅ Tabela '${table.name}': ${count} registros`)
      } catch (error) {
        console.log(`❌ Erro na tabela '${table.name}':`, error.message)
      }
    }

    console.log("\n📊 Exemplo de dados:")

    // Mostrar alguns dados de exemplo
    const participants = await prisma.participant.findMany({ take: 3 })
    console.log(`\n👥 Participantes (${participants.length}):`)
    participants.forEach((p) => console.log(`  - ${p.name} (${p.email})`))

    const sales = await prisma.sale.findMany({ take: 3, include: { participant: true } })
    console.log(`\n💰 Vendas (${sales.length}):`)
    sales.forEach((s) => console.log(`  - R$ ${s.amount} por ${s.participant.name}`))
  } catch (error) {
    console.error("❌ Erro ao verificar banco:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()
