# 🚀 Guia de Configuração do Prisma

## Status da Migração
✅ Schema do Prisma criado  
✅ Cliente Prisma configurado  
✅ Implementação de banco migrada  
✅ Scripts de teste criados  
✅ Compatibilidade mantida  

## Próximos Passos

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
DATABASE_URL="postgresql://username:password@hostname:port/database"
\`\`\`

### 2. Executar Comandos do Prisma
\`\`\`bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema com banco (desenvolvimento)
npx prisma db push

# Ou criar migration (produção)
npx prisma migrate dev --name init
\`\`\`

### 3. Testar Conexão
\`\`\`bash
# Testar conexão básica
npx tsx scripts/test-prisma-connection.ts

# Testar integração completa
npx tsx scripts/test-full-integration.ts

# Popular banco com dados de exemplo
npx tsx scripts/seed-database.ts
\`\`\`

## Estrutura do Banco

### Tabelas Criadas:
- **Admin**: Administradores do sistema
- **Participant**: Participantes das competições
- **Sale**: Vendas registradas
- **GameRule**: Regras de pontuação
- **Competition**: Competições ativas
- **Achievement**: Conquistas dos participantes

### Relacionamentos:
- Participant → Admin (many-to-one)
- Sale → Participant (many-to-one)
- Sale → Admin (many-to-one)
- Achievement → Participant (many-to-one)
- Competition → Admin (many-to-one)

## Funcionalidades Mantidas

✅ **Multi-tenancy**: Cada admin tem seus próprios dados  
✅ **Transações**: Operações críticas usam transações  
✅ **Integridade**: Relacionamentos e constraints mantidos  
✅ **Performance**: Queries otimizadas com índices  
✅ **Compatibilidade**: Interface idêntica ao sistema anterior  

## Comandos Úteis

\`\`\`bash
# Ver dados no banco
npx prisma studio

# Reset do banco (cuidado!)
npx prisma db push --force-reset

# Ver logs do Prisma
DEBUG="prisma:*" npm run dev
\`\`\`

## Troubleshooting

### Erro de Conexão
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está acessível
- Teste a conexão diretamente

### Tabelas não Existem
- Execute `npx prisma db push`
- Ou `npx prisma migrate dev`

### Dados não Aparecem
- Verifique se o `adminId` está correto
- Confirme se o usuário está logado
- Execute o script de teste
