import { database } from "../lib/database"

async function quickTest() {
  console.log("🧪 Teste rápido da conexão...")

  try {
    const participants = await database.getParticipants()
    console.log(`✅ Sucesso! Encontrados ${participants.length} participantes`)

    if (participants.length > 0) {
      console.log("📋 Primeiros participantes:")
      participants.slice(0, 3).forEach((p) => {
        console.log(`  - ${p.name}: ${p.points} pontos`)
      })
    }
  } catch (error) {
    console.error("❌ Erro:", error.message)
  }
}

quickTest()
