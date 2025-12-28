-- Adicionar user_id às tabelas categories e products para isolamento de dados por usuário

-- Adicionar coluna user_id na tabela categories (nullable primeiro)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Adicionar índice para user_id em categories
CREATE INDEX IF NOT EXISTS category_user_id_idx ON categories(user_id);

-- Remover constraint único antigo de name (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_name_unique' 
        AND conrelid = 'categories'::regclass
    ) THEN
        ALTER TABLE categories DROP CONSTRAINT categories_name_unique;
    END IF;
END $$;

-- Adicionar constraint único para name + user_id
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_user_id_unique ON categories(name, user_id);

-- Adicionar coluna user_id na tabela products (nullable primeiro)
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Adicionar índice para user_id em products
CREATE INDEX IF NOT EXISTS product_user_id_idx ON products(user_id);

-- Remover constraint único antigo de sku (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_sku_unique' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE products DROP CONSTRAINT products_sku_unique;
    END IF;
END $$;

-- Adicionar constraint único para sku + user_id (se sku não for null)
-- Nota: PostgreSQL não permite unique constraint com NULL, então usamos partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_user_id_unique 
ON products(sku, user_id) 
WHERE sku IS NOT NULL;

