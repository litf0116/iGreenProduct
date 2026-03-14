-- Migration: Add code column to sites table
-- Date: 2025-03-15
-- Issue: FB-008

ALTER TABLE sites ADD COLUMN IF NOT EXISTS code VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS country VARCHAR(10);
CREATE INDEX IF NOT EXISTS idx_sites_country ON sites(country);