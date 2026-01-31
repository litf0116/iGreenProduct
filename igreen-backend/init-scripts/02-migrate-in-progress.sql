-- Migration: Remove IN_PROGRESS status and migrate to DEPARTED
-- Run this script to migrate existing data

-- 1. Update existing IN_PROGRESS tickets to DEPARTED
UPDATE tickets SET status = 'DEPARTED' WHERE status = 'IN_PROGRESS';

-- 2. Update the ENUM type (MySQL requires this approach)
-- Since MySQL doesn't support direct ENUM modification, we need to drop and recreate

ALTER TABLE tickets
MODIFY COLUMN status ENUM('OPEN', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DEPARTED', 'ARRIVED', 'REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED') NOT NULL DEFAULT 'OPEN';

-- 3. Clean up any remaining IN_PROGRESS (should be none after step 1)
DELETE FROM tickets WHERE status = 'IN_PROGRESS';

-- 4. Final cleanup - remove IN_PROGRESS from ENUM
ALTER TABLE tickets
MODIFY COLUMN status ENUM('OPEN', 'ASSIGNED', 'ACCEPTED', 'DEPARTED', 'ARRIVED', 'REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED') NOT NULL DEFAULT 'OPEN';

SELECT 'Migration complete. IN_PROGRESS status removed, data migrated to DEPARTED.' as result;
