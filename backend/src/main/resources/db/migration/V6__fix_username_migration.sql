-- Fix migration for V5: Properly handle username column addition
-- This handles cases where V5 partially failed or applied incorrect SQL

-- Drop existing constraints/indexes if they exist (to handle idempotency)
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;

-- Check if username column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(100);
    END IF;
END $$;

-- Migrate existing data: Copy email to username for all users that don't have username set
UPDATE users SET username = email WHERE username IS NULL OR username = '';

-- Add unique constraint on username if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name='users' AND constraint_name='uq_users_username') THEN
        ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);
    END IF;
END $$;

-- Make the username column NOT NULL if not already
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Make email nullable if not already
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='email' 
               AND is_nullable='NO') THEN
        ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
