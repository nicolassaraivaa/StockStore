-- Add color and size columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS size TEXT;

