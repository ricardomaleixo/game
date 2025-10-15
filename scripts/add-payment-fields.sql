-- Script para adicionar campos de pagamento ao modelo Admin
ALTER TABLE admins ADD COLUMN IF NOT EXISTS "cpfCnpj" TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
