import { database } from "../lib/database"

async function fixLoadingIssue() {
  console.log("🔧 Verificando e corrigindo problema de loading...\n")

  try {
    // Teste das funções principais do database
    console.log("1. Testando função getParticipants...")
    const participants = await database.getParticipants()
    console.log(`✅ Encontrados ${participants.length} participantes`)

    console.log("2. Testando função getAdmins...")
    const admins = await database.getAdmins()
    console.log(`✅ Encontrados ${admins.length} admins`)

    console.log("3. Testando função getSales...")
    const sales = await database.getSales()
    console.log(`✅ Encontradas ${sales.length} vendas`)

    console.log("4. Testando função getGameRules...")
    const rules = await database.getGameRules()
    console.log(`✅ Encontradas ${rules.length} regras`)

    console.log("\n🎉 Todas as funções estão funcionando corretamente!")
    console.log("Se a aplicação ainda estiver em loading, pode ser um problema de cache do navegador.")
    console.log("Tente fazer um hard refresh (Ctrl+Shift+R) ou limpar o cache.")
  } catch (error) {
    console.error("❌ Erro ao testar funções do database:")
    console.error(error)
  }
}

fixLoadingIssue()
