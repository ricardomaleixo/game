import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('Nova!@#', 10)
    
    const admin = await prisma.admin.upsert({
      where: { email: 'ricardoaleixoo@gmail.com' },
      update: { 
        password: hashedPassword,
        name: 'Ricardo Aleixo' 
      },
      create: {
        name: 'Ricardo Aleixo',
        email: 'ricardoaleixoo@gmail.com',
        password: hashedPassword
      }
    })
    
    console.log('✅ Admin criado/atualizado:', {
      id: admin.id,
      name: admin.name,
      email: admin.email
    })
    
    // Criar alguns dados de exemplo
    await prisma.participant.create({
      data: {
        name: 'João Silva',
        email: 'joao@teste.com',
        position: 'Vendedor',
        points: 150,
        adminId: admin.id
      }
    }).catch(() => console.log('Participante já existe'))
    
    console.log('✅ Dados de exemplo criados!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()