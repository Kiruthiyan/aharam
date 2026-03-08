CREATE INDEX IF NOT EXISTS idx_students_dedupe_lookup
ON students (
    exam_batch,
    (upper(trim(center))),
    (lower(trim(full_name))),
    (regexp_replace(parent_phone_number, '[^0-9]', '', 'g'))
)
WHERE deleted_at IS NULL;
