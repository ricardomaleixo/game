-- Script para inicializar o banco de dados
-- Execute este script após conectar ao Prisma Cloud

-- Verificar se as tabelas foram criadas corretamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Inserir dados de exemplo (opcional)
-- Você pode executar este script após rodar as migrations
