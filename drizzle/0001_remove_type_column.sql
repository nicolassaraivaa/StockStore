-- Migration: Remove type column from categories table
-- This migration removes the type column that is no longer needed for inventory system

ALTER TABLE categories 
DROP COLUMN IF EXISTS type;

