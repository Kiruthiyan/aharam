CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    password_change_required BOOLEAN NOT NULL DEFAULT TRUE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    deleted_by BIGINT
);

CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT UNIQUE,
    barcode VARCHAR(255) NOT NULL UNIQUE,
    batch_or_class VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    father_occupation VARCHAR(255),
    mother_name VARCHAR(255) NOT NULL,
    mother_occupation VARCHAR(255),
    guardian_name VARCHAR(255),
    school_name VARCHAR(255),
    center VARCHAR(255) NOT NULL,
    medium VARCHAR(255) NOT NULL,
    exam_batch INTEGER NOT NULL,
    subjects VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    parent_phone_number VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(255),
    language_preference VARCHAR(2) NOT NULL DEFAULT 'EN',
    admission_date DATE,
    status VARCHAR(50) NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    batch VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    max_marks DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    exam_date DATE NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255),
    date DATE,
    status VARCHAR(50),
    method VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    marked_by BIGINT,
    batch_or_class VARCHAR(255),
    center VARCHAR(255),
    time TIME,
    teacher_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uk_attendance_student_date UNIQUE (student_id, date)
);

CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255),
    academic_year VARCHAR(255) NOT NULL,
    month VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    update_method VARCHAR(50),
    updated_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uk_fee_student_year_month UNIQUE (student_id, academic_year, month)
);

CREATE TABLE IF NOT EXISTS academic_results (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id VARCHAR(255),
    marks_obtained DOUBLE PRECISION NOT NULL,
    grade VARCHAR(50) NOT NULL,
    remarks VARCHAR(255),
    entered_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uk_result_student_exam UNIQUE (student_id, exam_id)
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255),
    module VARCHAR(255) NOT NULL,
    channel VARCHAR(255) NOT NULL,
    target_number VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    error_reason TEXT,
    triggered_by BIGINT,
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1500) NOT NULL,
    audience VARCHAR(255) NOT NULL,
    channel VARCHAR(255) NOT NULL,
    sent_by VARCHAR(255),
    sent_by_role VARCHAR(255),
    at VARCHAR(255) NOT NULL,
    status VARCHAR(255),
    whatsapp_count INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS otp_verification (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_logs (
    id BIGSERIAL PRIMARY KEY,
    fee_id BIGINT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by BIGINT,
    method VARCHAR(50),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT,
    action_type VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    resource_id BIGINT,
    ip_address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grade_rules (
    id BIGSERIAL PRIMARY KEY,
    grade_letter VARCHAR(255) NOT NULL UNIQUE,
    min_percentage DOUBLE PRECISION NOT NULL,
    max_percentage DOUBLE PRECISION NOT NULL
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id);

ALTER TABLE students
    ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id),
    ADD CONSTRAINT fk_students_created_by FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE exams
    ADD CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE attendance
    ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (student_id),
    ADD CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users (id);

ALTER TABLE fees
    ADD CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES students (student_id),
    ADD CONSTRAINT fk_fees_updated_by FOREIGN KEY (updated_by) REFERENCES users (id);

ALTER TABLE academic_results
    ADD CONSTRAINT fk_marks_exam FOREIGN KEY (exam_id) REFERENCES exams (id),
    ADD CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students (student_id),
    ADD CONSTRAINT fk_marks_entered_by FOREIGN KEY (entered_by) REFERENCES users (id);

ALTER TABLE notification_logs
    ADD CONSTRAINT fk_notification_logs_student FOREIGN KEY (student_id) REFERENCES students (student_id),
    ADD CONSTRAINT fk_notification_logs_triggered_by FOREIGN KEY (triggered_by) REFERENCES users (id);

ALTER TABLE fee_logs
    ADD CONSTRAINT fk_fee_logs_fee FOREIGN KEY (fee_id) REFERENCES fees (id),
    ADD CONSTRAINT fk_fee_logs_changed_by FOREIGN KEY (changed_by) REFERENCES users (id);

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users (id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students (deleted_at);
CREATE INDEX IF NOT EXISTS idx_students_exam_batch ON students (exam_batch);
CREATE INDEX IF NOT EXISTS idx_attendance_date_batch ON attendance (date, batch_or_class);
CREATE INDEX IF NOT EXISTS idx_attendance_deleted_at ON attendance (deleted_at);
CREATE INDEX IF NOT EXISTS idx_fees_year_month ON fees (academic_year, month);
CREATE INDEX IF NOT EXISTS idx_fees_deleted_at ON fees (deleted_at);
CREATE INDEX IF NOT EXISTS idx_marks_deleted_at ON academic_results (deleted_at);
CREATE INDEX IF NOT EXISTS idx_exams_deleted_at ON exams (deleted_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs (status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices (created_at);
CREATE INDEX IF NOT EXISTS idx_otp_email_created_at ON otp_verification (email, created_at);
