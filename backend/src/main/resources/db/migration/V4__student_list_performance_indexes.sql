CREATE INDEX IF NOT EXISTS idx_students_status_deleted_at
ON students (status, deleted_at);

CREATE INDEX IF NOT EXISTS idx_students_center_normalized
ON students ((upper(trim(center))));

CREATE INDEX IF NOT EXISTS idx_students_full_name_normalized
ON students ((lower(trim(full_name))));

CREATE INDEX IF NOT EXISTS idx_students_updated_at
ON students (updated_at DESC);
