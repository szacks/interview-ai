-- Rename agent_templates table to agents and remove description column
-- This migration handles the table rename and cleanup

-- Check if agent_templates table exists, if so rename it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_templates') THEN
    ALTER TABLE agent_templates RENAME TO agents;
    -- Remove description column after rename
    ALTER TABLE agents DROP COLUMN IF EXISTS description;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents') THEN
    -- If neither table exists, Hibernate will create it
    RAISE NOTICE 'Neither agent_templates nor agents table found - will be created by Hibernate';
  END IF;
END $$;
