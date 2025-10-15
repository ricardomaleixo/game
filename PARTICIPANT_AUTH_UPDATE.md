# Migração - Campo de Senha para Participantes

## Mudanças Implementadas

### 1. Schema do Banco (prisma/schema.prisma)
- ✅ Adicionado campo `password String?` no modelo `Participant`
- Campo opcional para permitir participantes sem senha (primeiro acesso)

### 2. Server Actions (app/actions/auth-actions.ts)
- ✅ Atualizada função `loginUser()` para verificar senha de participantes
- ✅ Implementada função `setParticipantPassword()` para definir senha real
- ✅ Adicionada lógica de primeiro acesso (needsPasswordSetup)
- ✅ Atualizada função `getCurrentUser()` para usar cookie de sessão correto

### 3. Hook de Autenticação (hooks/use-auth-prisma.tsx)
- ✅ Atualizada interface para suportar `needsPasswordSetup`
- ✅ Função `login()` agora retorna informações sobre configuração de senha

### 4. Formulário de Login (components/login-form.tsx)
- ✅ Simplificado para formulário único (email + senha)
- ✅ Adicionada lógica para detectar primeiro acesso automaticamente
- ✅ Integração com componente PasswordSetup para novos participantes

### 5. Script de Migração (scripts/migrate-password.js)
- ✅ Script criado para executar migração do banco
- Gera cliente Prisma e aplica migração automaticamente

## Fluxo de Autenticação Atualizado

### Administradores
1. Login com email/senha (como antes)
2. Redirecionamento para dashboard admin

### Participantes - Primeiro Acesso
1. Participante digita email cadastrado + qualquer senha
2. Sistema detecta que não tem senha definida
3. Mostra formulário de configuração de senha
4. Após definir senha, pode fazer login normalmente

### Participantes - Acessos Subsequentes
1. Login normal com email/senha
2. Redirecionamento para dashboard participante

## Para Aplicar as Mudanças

Execute o script de migração:
\`\`\`bash
node scripts/migrate-password.js
\`\`\`

Ou manualmente:
\`\`\`bash
npx prisma generate
npx prisma migrate dev --name add_participant_password
\`\`\`

## Testando

1. **Admin:** Faça login com `admin@empresa.com` / `admin123`
2. **Novo Participante:** 
   - Admin cria participante
   - Participante faz primeiro login (email + qualquer senha)
   - Sistema solicita criação de senha
   - Próximos logins usam a senha definida

## Observações Técnicas

- Campo `password` é opcional no banco para manter compatibilidade
- Senhas são hasheadas com bcrypt (salt 10)
- Sessions são mantidas via httpOnly cookies
- Tipos TypeScript atualizados para incluir `createdAt`
- Lógica de dois fatores removida do formulário (simplificado)
