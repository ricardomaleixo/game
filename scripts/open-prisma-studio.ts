import { exec } from "child_process"

console.log("🚀 Abrindo Prisma Studio...")
console.log("📊 Interface será aberta em: http://localhost:5555")
console.log("💡 Use Ctrl+C para fechar o Prisma Studio")

// Executa o Prisma Studio
const studio = exec("npx prisma studio", (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Erro ao abrir Prisma Studio: ${error}`)
    return
  }
  if (stderr) {
    console.error(`⚠️ Aviso: ${stderr}`)
  }
  console.log(stdout)
})

studio.stdout?.on("data", (data) => {
  console.log(data)
})

studio.stderr?.on("data", (data) => {
  console.error(data)
})
