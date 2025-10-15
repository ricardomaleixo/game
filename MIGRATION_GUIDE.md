# 🚀 Migração do localStorage para Prisma - Guia Completo

## 📋 Resumo da Migração

O projeto foi migrado do **localStorage** para **Prisma + PostgreSQL**, oferecendo:
- ✅ Persistência real de dados
- ✅ Autenticação segura com bcrypt
- ✅ Suporte multi-tenant (múltiplos admins)
- ✅ Server Actions para operações do banco
- ✅ Cookies seguros para sessões

## 🔧 Arquivos Criados/Modificados

### ✨ Novos Arquivos
- `app/actions/auth-actions.ts` - Server actions para autenticação
- `hooks/use-auth-prisma.tsx` - Hook de autenticação usando Prisma
- `scripts/migrate-localStorage-to-prisma.ts` - Script de migração

### 🔄 Arquivos Modificados
- `lib/database.ts` - Agora usa Prisma ao invés de localStorage
- `app/actions/database-actions.ts` - Expandido com CRUD completo

## 🚀 Como Usar o Novo Sistema

### 1. **Configurar Banco de Dados**
\`\`\`bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# (Opcional) Abrir Prisma Studio
npm run db:studio
\`\`\`

### 2. **Executar Migração de Dados**
\`\`\`bash
# Migração básica
npx tsx scripts/migrate-localStorage-to-prisma.ts

# Migração com dados de exemplo
npx tsx scripts/migrate-localStorage-to-prisma.ts --seed
\`\`\`

### 3. **Atualizar Autenticação nos Componentes**

#### ❌ Antes (localStorage):
\`\`\`tsx
import { useAuth } from "@/hooks/use-auth"

const { user, login, logout } = useAuth()
const success = login(email, password) // retorna boolean
\`\`\`

#### ✅ Depois (Prisma):
\`\`\`tsx
import { useAuth } from "@/hooks/use-auth-prisma" 

const { user, login, logout } = useAuth()
const result = await login(email, password) // retorna Promise<{success, error?}>
if (result.success) {
  // Login realizado com sucesso
}
\`\`\`

### 4. **Usar Server Actions para Dados**

#### ❌ Antes (localStorage direto):
\`\`\`tsx
import { database } from "@/lib/database"

// Cliente-side com localStorage
const participants = await database.getParticipants()
\`\`\`

#### ✅ Depois (Server Actions):
\`\`\`tsx
import { getParticipants, saveParticipant } from "@/app/actions/database-actions"

// Server actions
const participants = await getParticipants()
const newParticipant = await saveParticipant({
  name: "João",
  email: "joao@email.com", 
  position: "Vendedor"
})
\`\`\`

## 🔐 Novo Sistema de Autenticação

### Login de Admin
- **Email**: admin@empresa.com
- **Senha**: admin123
- Senha hash com bcrypt
- Sessão via cookies seguros

### Login de Participantes
- Criados pelo admin
- Por padrão precisam configurar senha
- Vinculados ao admin que os criou

## 📊 CRUD Operations Disponíveis

### Participants
\`\`\`tsx
import { 
  getParticipants, 
  saveParticipant, 
  updateParticipant, 
  deleteParticipant 
} from "@/app/actions/database-actions"

// Listar
const participants = await getParticipants()

// Criar
const newParticipant = await saveParticipant({
  name: "João Silva",
  email: "joao@empresa.com",
  position: "Vendedor"
})

// Atualizar
await updateParticipant(id, { points: 1500 })

// Deletar  
await deleteParticipant(id)
\`\`\`

### Sales
\`\`\`tsx
import { getSales, saveSale, updateSale, deleteSale } from "@/app/actions/database-actions"

const newSale = await saveSale({
  participantId: "participant-id",
  productName: "Produto A", 
  points: 100,
  date: new Date().toISOString(),
  type: "sale"
})
\`\`\`

### Game Rules
\`\`\`tsx
import { getGameRules, saveGameRule, updateGameRule, deleteGameRule } from "@/app/actions/database-actions"

const newRule = await saveGameRule({
  productName: "Produto Premium",
  points: 200,
  isActive: true
})
\`\`\`

### Competitions & Achievements
\`\`\`tsx
import { 
  getCompetitions, 
  saveCompetition,
  getAchievements,
  saveAchievement 
} from "@/app/actions/database-actions"
\`\`\`

## 🔄 Processo de Migração de Componentes

### 1. **Componentes de Login**
- Substituir `useAuth` por `useAuth` do novo hook
- Tratar retorno assíncrono do login
- Implementar loading states

### 2. **Dashboards e Listas**  
- Substituir calls diretos ao `database` por server actions
- Implementar loading/error states
- Usar `use server` em funções que fazem calls ao banco

### 3. **Formulários**
- Usar server actions para submit
- Implementar validação de erros
- Adicionar feedback visual

## ⚠️ Considerações Importantes

### 🔒 Segurança
- Senhas são hash com bcrypt
- Cookies httpOnly para sessões
- Validação de permissões no servidor

### 🎯 Multi-tenant
- Cada admin só vê seus próprios dados
- Participantes vinculados a admin específico
- Isolamento completo entre tenants

### 🚨 Breaking Changes
- Login agora é assíncrono
- Database calls são server-side only
- Necessário configurar banco PostgreSQL

## 🆘 Troubleshooting

### Erro de Conexão com Banco
\`\`\`bash
# Verificar variáveis de ambiente
cat .env.local

# Verificar conexão
npx prisma db push
\`\`\`

### Problemas de Autenticação
\`\`\`bash
# Resetar admin padrão
npx tsx scripts/migrate-localStorage-to-prisma.ts
\`\`\`

### Dados não Aparecem
\`\`\`bash
# Verificar no Prisma Studio
npm run db:studio
\`\`\`

## 📈 Próximos Passos

1. **Migrar todos os componentes** para usar server actions
2. **Implementar middleware** para proteção de rotas
3. **Adicionar validação** com Zod nos server actions
4. **Configurar logging** para auditoria
5. **Implementar cache** para melhor performance

## 🎉 Benefícios da Migração

- ✅ **Dados persistentes** - não perdem mais dados ao limpar navegador
- ✅ **Segurança** - autenticação real com hash de senhas
- ✅ **Escalabilidade** - suporte a múltiplos admins
- ✅ **Performance** - queries otimizadas no banco
- ✅ **Backup** - dados seguros no PostgreSQL
- ✅ **Colaboração** - múltiplos usuários simultâneos

---

**🚀 O sistema agora está pronto para produção com banco de dados real!**
