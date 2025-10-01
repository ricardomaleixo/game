import { PrismaClient } from '@prisma/client'
import { 
  findUserByEmail, 
  participantNeedsPasswordSetup,
  setParticipantPassword,
  loginUser 
} from '../app/actions/auth-actions'

const prisma = new PrismaClient()

async function testParticipantFlow() {
  console.log('🧪 Testando fluxo completo de participante...\n')

  try {
    // 1. Simular que um admin está criando um participante
    console.log('1. Criando participante como admin...')
    
    // Para o teste, vamos assumir que temos um admin
    const testAdmin = await prisma.admin.findFirst()
    if (!testAdmin) {
      console.log('❌ Nenhum admin encontrado. Execute o script de setup primeiro.')
      return
    }

    const participantData = {
      name: 'João Teste',
      email: 'joao.teste@exemplo.com',
      position: 'Vendedor',
      adminId: testAdmin.id
    }

    console.log(`   Criando: ${participantData.name} (${participantData.email})`)

    // Limpar participante existente se houver
    await prisma.participant.deleteMany({
      where: { email: participantData.email }
    })

    const newParticipant = await prisma.participant.create({
      data: participantData
    })

    console.log(`   ✅ Participante criado: ID ${newParticipant.id}`)

    // 2. Simular primeiro login do participante
    console.log('\n2. Testando primeiro login do participante...')
    
    const userResult = await findUserByEmail(participantData.email)
    console.log(`   Resultado da busca:`, {
      success: userResult.success,
      needsPasswordSetup: userResult.needsPasswordSetup,
      userRole: userResult.user?.role
    })

    if (!userResult.success) {
      console.log('❌ Erro: usuário não encontrado')
      return
    }

    if (!userResult.needsPasswordSetup) {
      console.log('❌ Erro: deveria precisar configurar senha')
      return
    }

    console.log('   ✅ Participante precisa configurar senha (como esperado)')

    // 3. Configurar senha
    console.log('\n3. Configurando senha do participante...')
    const passwordResult = await setParticipantPassword(participantData.email, 'senha123')
    
    if (passwordResult.success) {
      console.log('   ✅ Senha configurada com sucesso')
    } else {
      console.log(`   ❌ Erro ao configurar senha: ${passwordResult.error}`)
      return
    }

    // 4. Testar login completo (simulado)
    console.log('\n4. Verificando estado final...')
    
    // Verificar se o participante ainda existe
    const finalCheck = await findUserByEmail(participantData.email)
    console.log(`   Status final:`, {
      success: finalCheck.success,
      role: finalCheck.user?.role,
      needsPasswordSetup: finalCheck.needsPasswordSetup
    })

    console.log('\n✅ Teste completo! Fluxo funcionando corretamente.')
    
    // Limpeza
    console.log('\n🧹 Limpando dados de teste...')
    await prisma.participant.delete({
      where: { id: newParticipant.id }
    })
    console.log('   ✅ Dados de teste removidos')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testParticipantFlow()
}

export { testParticipantFlow }