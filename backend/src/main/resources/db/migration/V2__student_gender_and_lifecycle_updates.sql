ALTER TABLE students
    ADD COLUMN IF NOT EXISTS gender VARCHAR(16) NOT NULL DEFAULT 'UNSPECIFIED';

UPDATE students
SET gender = 'UNSPECIFIED'
WHERE gender IS NULL OR gender = '';

CREATE INDEX IF NOT EXISTS idx_students_gender ON students (gender);
