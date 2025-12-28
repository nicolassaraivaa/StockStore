-- Adicionar novas colunas à tabela transactions
DO $$ BEGIN
  ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "product_id" uuid;
  ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "quantity" integer NOT NULL DEFAULT 1;
  ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "unit_price" double precision NOT NULL DEFAULT 0;
  ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "client_name" text;
  ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "observations" text;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Adicionar foreign key para product_id se não existir
DO $$ BEGIN
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_id_products_id_fk" 
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar índice para product_id se não existir
CREATE INDEX IF NOT EXISTS "product_id_idx" ON "transactions" USING btree ("product_id");

-- Remover índices antigos se existirem
DROP INDEX IF EXISTS "user_id_date_category_idx";

-- Remover foreign key antiga se existir
DO $$ BEGIN
  ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_category_id_categories_id_fk";
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Remover colunas antigas se existirem (opcional - descomente se quiser remover)
-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "description";
-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "amount";
-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "category_id";

