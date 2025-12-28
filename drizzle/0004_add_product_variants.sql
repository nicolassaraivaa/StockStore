-- Adicionar campo has_variants na tabela products
ALTER TABLE "products" 
ADD COLUMN IF NOT EXISTS "has_variants" integer DEFAULT 0 NOT NULL;

-- Tornar campos de preço e estoque opcionais (para produtos com variantes)
ALTER TABLE "products" 
ALTER COLUMN "cost_price" DROP NOT NULL,
ALTER COLUMN "sale_price" DROP NOT NULL,
ALTER COLUMN "stock_quantity" DROP NOT NULL;

-- Criar tabela de variantes de produtos
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"color" text,
	"size" text,
	"sku" text,
	"cost_price" double precision,
	"sale_price" double precision,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_product_id_product_variants_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_product_id_color_size_unique" UNIQUE("product_id","color","size")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variant_product_id_idx" ON "product_variants" USING btree ("product_id");

-- Adicionar campo variant_id na tabela transactions
ALTER TABLE "transactions" 
ADD COLUMN IF NOT EXISTS "variant_id" uuid;

-- Adicionar foreign key para variant_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_variant_id_product_variants_id_fk'
    ) THEN
        ALTER TABLE "transactions" 
        ADD CONSTRAINT "transactions_variant_id_product_variants_id_fk" 
        FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
END $$;

-- Criar índice para variant_id
CREATE INDEX IF NOT EXISTS "variant_id_idx" ON "transactions" USING btree ("variant_id");

