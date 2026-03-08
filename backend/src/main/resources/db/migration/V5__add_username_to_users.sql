-- Add username column to users table (initially nullable)
ALTER TABLE users ADD COLUMN username VARCHAR(100);

-- Migrate existing data: Copy email to username for all users
UPDATE users SET username = email WHERE username IS NULL;

-- Now add the unique constraint on username
ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);

-- Make the username column NOT NULL
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Make email nullable to support students without email (PostgreSQL syntax)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add index on username for faster lookups during login
CREATE INDEX idx_users_username ON users (username);

-- Add index on email for faster lookups during login
CREATE INDEX idx_users_email ON users (email);
