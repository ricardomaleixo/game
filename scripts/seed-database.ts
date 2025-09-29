import { prisma } from "../lib/prisma"

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...")

    // Criar admin de exemplo
    const admin = await prisma.admin.upsert({
      where: { email: "admin@exemplo.com" },
      update: {},
      create: {
        id: "1",
        name: "Administrador",
        email: "admin@exemplo.com",
        password: "admin123", // Em produção, use hash
      },
    })
    console.log("👤 Admin criado:", admin.name)

    // Criar participantes de exemplo
    const participants = await Promise.all([
      prisma.participant.upsert({
        where: { email: "joao@exemplo.com" },
        update: {},
        create: {
          name: "João Silva",
          email: "joao@exemplo.com",
          position: "Vendedor",
          points: 0,
          adminId: admin.id,
        },
      }),
      prisma.participant.upsert({
        where: { email: "maria@exemplo.com" },
        update: {},
        create: {
          name: "Maria Santos",
          email: "maria@exemplo.com",
          position: "Vendedora",
          points: 0,
          adminId: admin.id,
        },
      }),
    ])
    console.log(`👥 ${participants.length} participantes criados`)

    // Criar regras do jogo de exemplo
    const gameRules = await Promise.all([
      prisma.gameRule.upsert({
        where: { id: "rule-1" },
        update: {},
        create: {
          id: "rule-1",
          productName: "Produto A",
          points: 10,
          isActive: true,
          adminId: admin.id,
        },
      }),
      prisma.gameRule.upsert({
        where: { id: "rule-2" },
        update: {},
        create: {
          id: "rule-2",
          productName: "Produto B",
          points: 15,
          isActive: true,
          adminId: admin.id,
        },
      }),
    ])
    console.log(`🎮 ${gameRules.length} regras do jogo criadas`)

    // Criar competição de exemplo
    const competition = await prisma.competition.upsert({
      where: { id: "comp-1" },
      update: {},
      create: {
        id: "comp-1",
        name: "Competição de Vendas Q1",
        type: "tower",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        isActive: true,
        rules: {},
        participants: participants.map((p) => p.id),
        adminId: admin.id,
      },
    })
    console.log("🏆 Competição criada:", competition.name)

    console.log("\n✅ Seed do banco de dados concluído com sucesso!")
    console.log("🔑 Credenciais de teste:")
    console.log("   Admin: admin@exemplo.com / admin123")
    console.log("   Participante 1: joao@exemplo.com")
    console.log("   Participante 2: maria@exemplo.com")
  } catch (error) {
    console.error("❌ Erro durante o seed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
