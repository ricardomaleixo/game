// Script para limpar toda a base de usuários mantendo apenas o admin
console.log("[v0] Iniciando limpeza da base de usuários...")

// Função para limpar dados do localStorage
function clearUserData() {
  // Limpar todos os dados de participantes
  localStorage.setItem("gamified-sales-participants", "[]")

  // Limpar todas as vendas
  localStorage.setItem("gamified-sales-sales", "[]")

  // Limpar todas as conquistas
  localStorage.setItem("gamified-sales-achievements", "[]")

  // Limpar todas as competições
  localStorage.setItem("gamified-sales-competitions", "[]")

  // Opcional: Limpar regras do jogo (descomente se quiser limpar também)
  // localStorage.setItem("gamified-sales-game-rules", "[]")

  console.log("[v0] ✅ Base de usuários limpa com sucesso!")
  console.log("[v0] Dados removidos:")
  console.log("[v0] - Todos os participantes")
  console.log("[v0] - Todas as vendas")
  console.log("[v0] - Todas as conquistas")
  console.log("[v0] - Todas as competições")
  console.log("[v0] Dados mantidos:")
  console.log("[v0] - Dados do administrador")
  console.log("[v0] - Regras do jogo (podem ser reutilizadas)")
}

// Executar limpeza
clearUserData()
