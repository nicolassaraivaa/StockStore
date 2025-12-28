-- Criar tabela users
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY NOT NULL, -- UUID do Supabase Auth
  "email" TEXT NOT NULL,
  "name" TEXT,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL
);

-- Criar índice para email
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Primeiro, precisamos criar registros na tabela users para os user_ids existentes
-- que estão nas outras tabelas (se houver)


-- Adicionar foreign keys nas tabelas existentes
-- Primeiro, tornar user_id NOT NULL nas tabelas

-- Atualizar categories (deletar categorias sem user_id primeiro, pois não podem ser NOT NULL)
DELETE FROM "categories" WHERE "user_id" IS NULL;

DO $$ 
BEGIN
    ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao tornar user_id NOT NULL em categories: %', SQLERRM;
END $$;

-- Adicionar foreign key em categories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "categories" 
        ADD CONSTRAINT "categories_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao adicionar foreign key em categories: %', SQLERRM;
END $$;

-- Atualizar products (deletar produtos sem user_id primeiro)
DELETE FROM "products" WHERE "user_id" IS NULL;

DO $$ 
BEGIN
    ALTER TABLE "products" ALTER COLUMN "user_id" SET NOT NULL;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao tornar user_id NOT NULL em products: %', SQLERRM;
END $$;

-- Adicionar foreign key em products
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "products" 
        ADD CONSTRAINT "products_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao adicionar foreign key em products: %', SQLERRM;
END $$;

-- Atualizar transactions (deletar transações sem user_id primeiro)
DELETE FROM "transactions" WHERE "user_id" IS NULL;

DO $$ 
BEGIN
    ALTER TABLE "transactions" ALTER COLUMN "user_id" SET NOT NULL;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao tornar user_id NOT NULL em transactions: %', SQLERRM;
END $$;

-- Adicionar foreign key em transactions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao adicionar foreign key em transactions: %', SQLERRM;
END $$;

-- Criar função para criar usuário automaticamente quando criar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que chama a função quando um usuário é criado no auth.users
-- Nota: Este trigger precisa ser criado no schema auth do Supabase
-- Você precisará executar isso manualmente no SQL Editor do Supabase:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

