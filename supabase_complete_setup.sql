-- =========================================================================
-- VAISHNAVI CLASSES (SINCE 1996) — SUPABASE POSTGRESQL COMPLETE SETUP SCRIPT
-- Project: Vaishnaviclasses
-- Project Ref: ubvbndbqfedejywynuwc
-- Dashboard URL: https://supabase.com/dashboard/project/ubvbndbqfedejywynuwc
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard -> Project 'ubvbndbqfedejywynuwc' -> SQL Editor
--    Direct Link: https://supabase.com/dashboard/project/ubvbndbqfedejywynuwc/sql/new
-- 2. Paste this entire script and click "RUN" (or Ctrl+Enter).
-- 3. All tables and existing database records will be populated instantly!
-- =========================================================================

-- =====================================================
-- VAISHNAVI CLASSES — POSTGRESQL DDL SCHEMA FOR SUPABASE
-- Project ID: ubvbndbqfedejywynuwc
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE institutes (
	name VARCHAR(255) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	email VARCHAR(255), 
	phone VARCHAR(50), 
	address TEXT, 
	logo_url VARCHAR(500), 
	currency VARCHAR(10) NOT NULL, 
	currency_symbol VARCHAR(10) NOT NULL, 
	upi_id VARCHAR(100), 
	upi_qr_image VARCHAR(500), 
	is_active BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE academic_years (
	institute_id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	start_date DATE NOT NULL, 
	end_date DATE NOT NULL, 
	is_current BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE conversations (
	institute_id VARCHAR(36) NOT NULL, 
	title VARCHAR(150), 
	is_direct BOOLEAN NOT NULL, 
	last_message_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE courses (
	institute_id VARCHAR(36) NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	description TEXT, 
	duration_months INTEGER NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE enquiries (
	institute_id VARCHAR(36), 
	customer_name VARCHAR(150) NOT NULL, 
	mobile_number VARCHAR(30) NOT NULL, 
	email VARCHAR(150), 
	service_type VARCHAR(100) NOT NULL, 
	message TEXT NOT NULL, 
	source VARCHAR(50) NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE institute_settings (
	institute_id VARCHAR(36) NOT NULL, 
	receipt_prefix VARCHAR(20) NOT NULL, 
	receipt_footer_note TEXT, 
	allow_student_upi_submission BOOLEAN NOT NULL, 
	enable_whatsapp_reminders BOOLEAN NOT NULL, 
	signatory_name VARCHAR(150), 
	signatory_designation VARCHAR(100), 
	signature_image_path VARCHAR(500), 
	signature_enabled BOOLEAN NOT NULL, 
	signature_version INTEGER NOT NULL, 
	custom_fields JSON, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (institute_id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE upi_accounts (
	institute_id VARCHAR(36) NOT NULL, 
	account_holder_name VARCHAR(150) NOT NULL, 
	upi_id VARCHAR(100) NOT NULL, 
	display_name VARCHAR(100) NOT NULL, 
	bank_name VARCHAR(100), 
	payment_instructions TEXT, 
	is_active BOOLEAN NOT NULL, 
	is_default BOOLEAN NOT NULL, 
	created_by VARCHAR(36), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE users (
	institute_id VARCHAR(36) NOT NULL, 
	login_id VARCHAR(50) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	role VARCHAR(20) NOT NULL, 
	full_name VARCHAR(150) NOT NULL, 
	email VARCHAR(255), 
	phone VARCHAR(50), 
	avatar_url VARCHAR(500), 
	is_active BOOLEAN NOT NULL, 
	must_change_password BOOLEAN NOT NULL, 
	last_login TIMESTAMP WITHOUT TIME ZONE, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
	institute_id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	action VARCHAR(100) NOT NULL, 
	target_type VARCHAR(50) NOT NULL, 
	target_id VARCHAR(50), 
	details JSON, 
	ip_address VARCHAR(50), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE classes (
	course_id VARCHAR(36) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE TABLE conversation_members (
	conversation_id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36) NOT NULL, 
	last_read_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE fee_plans (
	institute_id VARCHAR(36) NOT NULL, 
	course_id VARCHAR(36), 
	name VARCHAR(150) NOT NULL, 
	description TEXT, 
	admission_fee NUMERIC(12, 2) NOT NULL, 
	tuition_fee NUMERIC(12, 2) NOT NULL, 
	examination_fee NUMERIC(12, 2) NOT NULL, 
	library_fee NUMERIC(12, 2) NOT NULL, 
	transport_fee NUMERIC(12, 2) NOT NULL, 
	custom_fee NUMERIC(12, 2) NOT NULL, 
	total_amount NUMERIC(12, 2) NOT NULL, 
	discount_type VARCHAR(20) NOT NULL, 
	discount_value NUMERIC(12, 2) NOT NULL, 
	discount_amount NUMERIC(12, 2) NOT NULL, 
	discount_reason VARCHAR(255), 
	installment_frequency VARCHAR(20) NOT NULL, 
	number_of_installments INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE, 
	FOREIGN KEY(course_id) REFERENCES courses (id) ON DELETE SET NULL
);

CREATE TABLE messages (
	conversation_id VARCHAR(36) NOT NULL, 
	sender_id VARCHAR(36) NOT NULL, 
	content TEXT NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(conversation_id) REFERENCES conversations (id) ON DELETE CASCADE, 
	FOREIGN KEY(sender_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE notifications (
	user_id VARCHAR(36) NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	message TEXT NOT NULL, 
	notification_type VARCHAR(50) NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	action_url VARCHAR(255), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE sessions (
	user_id VARCHAR(36) NOT NULL, 
	token VARCHAR(500) NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	ip_address VARCHAR(50), 
	user_agent VARCHAR(255), 
	is_revoked BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE staff_profiles (
	user_id VARCHAR(36) NOT NULL, 
	institute_id VARCHAR(36) NOT NULL, 
	staff_id VARCHAR(50) NOT NULL, 
	designation VARCHAR(100) NOT NULL, 
	qualification VARCHAR(150), 
	joining_date DATE NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE student_profiles (
	user_id VARCHAR(36) NOT NULL, 
	institute_id VARCHAR(36) NOT NULL, 
	student_id VARCHAR(50) NOT NULL, 
	dob DATE, 
	gender VARCHAR(20), 
	guardian_name VARCHAR(150), 
	guardian_phone VARCHAR(50), 
	guardian_relation VARCHAR(50), 
	address TEXT, 
	admission_date DATE NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE
);

CREATE TABLE batches (
	class_id VARCHAR(36) NOT NULL, 
	academic_year_id VARCHAR(36), 
	name VARCHAR(100) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	subject VARCHAR(150), 
	start_date DATE, 
	end_date DATE, 
	start_time VARCHAR(20), 
	end_time VARCHAR(20), 
	batch_days VARCHAR(100), 
	max_capacity INTEGER NOT NULL, 
	assigned_staff_name VARCHAR(150), 
	description TEXT, 
	status VARCHAR(20) NOT NULL, 
	created_by VARCHAR(36), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(class_id) REFERENCES classes (id) ON DELETE CASCADE, 
	FOREIGN KEY(academic_year_id) REFERENCES academic_years (id) ON DELETE SET NULL
);

CREATE TABLE payments (
	institute_id VARCHAR(36) NOT NULL, 
	student_id VARCHAR(36) NOT NULL, 
	collected_by_user_id VARCHAR(36), 
	amount NUMERIC(12, 2) NOT NULL, 
	payment_method VARCHAR(30) NOT NULL, 
	transaction_ref VARCHAR(100), 
	proof_image_url VARCHAR(500), 
	payment_date DATE NOT NULL, 
	recipient_upi_id VARCHAR(100), 
	recipient_upi_name VARCHAR(150), 
	status VARCHAR(30) NOT NULL, 
	rejection_reason TEXT, 
	reversal_reason TEXT, 
	reversed_at TIMESTAMP WITHOUT TIME ZONE, 
	notes TEXT, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE, 
	FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
	FOREIGN KEY(collected_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE staff_permissions (
	staff_profile_id VARCHAR(36) NOT NULL, 
	can_collect_fees BOOLEAN NOT NULL, 
	can_verify_upi BOOLEAN NOT NULL, 
	can_send_reminders BOOLEAN NOT NULL, 
	can_view_reports BOOLEAN NOT NULL, 
	can_manage_students BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (staff_profile_id), 
	FOREIGN KEY(staff_profile_id) REFERENCES staff_profiles (id) ON DELETE CASCADE
);

CREATE TABLE student_fee_assignments (
	student_id VARCHAR(36) NOT NULL, 
	fee_plan_id VARCHAR(36) NOT NULL, 
	base_amount NUMERIC(12, 2) NOT NULL, 
	original_fee_amount NUMERIC(12, 2) NOT NULL, 
	discount_type VARCHAR(20) NOT NULL, 
	discount_value NUMERIC(12, 2) NOT NULL, 
	discount_amount NUMERIC(12, 2) NOT NULL, 
	scholarship_amount NUMERIC(12, 2) NOT NULL, 
	discount_reason VARCHAR(255), 
	scholarship_reason VARCHAR(255), 
	discount_applied_by VARCHAR(36), 
	discount_applied_at TIMESTAMP WITHOUT TIME ZONE, 
	net_payable NUMERIC(12, 2) NOT NULL, 
	total_paid NUMERIC(12, 2) NOT NULL, 
	remaining_balance NUMERIC(12, 2) NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
	FOREIGN KEY(fee_plan_id) REFERENCES fee_plans (id) ON DELETE RESTRICT
);

CREATE TABLE enrollments (
	student_id VARCHAR(36) NOT NULL, 
	batch_id VARCHAR(36) NOT NULL, 
	academic_year_id VARCHAR(36) NOT NULL, 
	roll_number VARCHAR(50), 
	enrollment_date DATE NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
	FOREIGN KEY(batch_id) REFERENCES batches (id) ON DELETE CASCADE, 
	FOREIGN KEY(academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);

CREATE TABLE installments (
	fee_assignment_id VARCHAR(36) NOT NULL, 
	installment_number INTEGER NOT NULL, 
	title VARCHAR(100) NOT NULL, 
	due_amount NUMERIC(12, 2) NOT NULL, 
	paid_amount NUMERIC(12, 2) NOT NULL, 
	due_date DATE NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(fee_assignment_id) REFERENCES student_fee_assignments (id) ON DELETE CASCADE
);

CREATE TABLE receipts (
	payment_id VARCHAR(36) NOT NULL, 
	receipt_number VARCHAR(50) NOT NULL, 
	amount_paid NUMERIC(12, 2) NOT NULL, 
	balance_after NUMERIC(12, 2) NOT NULL, 
	original_amount NUMERIC(12, 2), 
	discount_amount NUMERIC(12, 2), 
	final_payable NUMERIC(12, 2), 
	signatory_name VARCHAR(150), 
	signatory_designation VARCHAR(100), 
	signature_image_path VARCHAR(500), 
	qr_code_data TEXT NOT NULL, 
	pdf_filename VARCHAR(255), 
	generated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (payment_id), 
	FOREIGN KEY(payment_id) REFERENCES payments (id) ON DELETE CASCADE
);

CREATE TABLE staff_batch_assignments (
	staff_profile_id VARCHAR(36) NOT NULL, 
	batch_id VARCHAR(36) NOT NULL, 
	is_primary BOOLEAN NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(staff_profile_id) REFERENCES staff_profiles (id) ON DELETE CASCADE, 
	FOREIGN KEY(batch_id) REFERENCES batches (id) ON DELETE CASCADE
);

CREATE TABLE payment_allocations (
	payment_id VARCHAR(36) NOT NULL, 
	installment_id VARCHAR(36) NOT NULL, 
	allocated_amount NUMERIC(12, 2) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(payment_id) REFERENCES payments (id) ON DELETE CASCADE, 
	FOREIGN KEY(installment_id) REFERENCES installments (id) ON DELETE CASCADE
);

CREATE TABLE reminders (
	institute_id VARCHAR(36) NOT NULL, 
	student_id VARCHAR(36) NOT NULL, 
	installment_id VARCHAR(36), 
	sent_by_user_id VARCHAR(36), 
	template_type VARCHAR(50) NOT NULL, 
	recipient_phone VARCHAR(50) NOT NULL, 
	message_text TEXT NOT NULL, 
	whatsapp_url TEXT, 
	status VARCHAR(20) NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(institute_id) REFERENCES institutes (id) ON DELETE CASCADE, 
	FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
	FOREIGN KEY(installment_id) REFERENCES installments (id) ON DELETE SET NULL, 
	FOREIGN KEY(sent_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);


-- =========================================================================
-- DATA RESTORE
-- =========================================================================

-- =====================================================
-- VAISHNAVI CLASSES — SUPABASE POSTGRESQL MIGRATION
-- Project ID: ubvbndbqfedejywynuwc
-- Generated automatically from local feeflow.db
-- =====================================================

SET session_replication_role = 'replica';

-- Data for table: institutes (1 rows)
INSERT INTO "institutes" ("name", "code", "email", "phone", "address", "logo_url", "currency", "currency_symbol", "upi_id", "upi_qr_image", "is_active", "id", "created_at", "updated_at") VALUES ('Vaishnavi Classes', 'VAISHNAVI01', 'contact@vaishnaviclasses.com', '+91 98765 43210', 'Main Campus, Vaishnavi Classes', 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80', 'INR', '₹', 'vaishnaviclasses@upi', NULL, 1, '3395372a-42ae-4a38-8792-9b631ba0a825', '2026-11-20 07:05:42.932816', '2026-11-20 12:53:35.390808') ON CONFLICT DO NOTHING;

-- Data for table: institute_settings (1 rows)
INSERT INTO "institute_settings" ("institute_id", "receipt_prefix", "receipt_footer_note", "allow_student_upi_submission", "enable_whatsapp_reminders", "custom_fields", "id", "created_at", "updated_at", "signatory_name", "signatory_designation", "signature_image_path", "signature_enabled", "signature_version") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'REC-2026-', 'Thank you for your payment to Vaishnavi Classes. This is a computer-generated receipt with digital QR verification.', 1, 1, '{}', '0d8e0832-90ae-4e36-a9e9-b6d2ef5792ce', '2026-11-20 07:05:43.345993', '2026-11-20 12:53:35.392228', 'Director / Authorized Signatory', 'Authorized Signatory', NULL, 1, 1) ON CONFLICT DO NOTHING;

-- Data for table: upi_accounts (1 rows)
INSERT INTO "upi_accounts" ("institute_id", "account_holder_name", "upi_id", "display_name", "bank_name", "payment_instructions", "is_active", "is_default", "created_by", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'Vaishnavi Classes', 'vaishnaviclasses@upi', 'Vaishnavi Classes Primary Desk', 'HDFC Bank', 'Scan QR code using Google Pay, PhonePe, Paytm, or BHIM. After paying, submit 12-digit UTR ref for instant verification.', 1, 1, 'system', '24a86999-8cc4-49d1-9977-a4d5dc565c28', '2026-11-26 13:03:16.390415', '2026-11-26 13:03:16.390418') ON CONFLICT DO NOTHING;

-- Data for table: academic_years (1 rows)
INSERT INTO "academic_years" ("institute_id", "name", "start_date", "end_date", "is_current", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '2026-2027', '2026-04-01', '2027-03-31', 1, 'c817b3cb-e19f-486e-93bb-128b6d32406a', '2026-11-20 07:05:43.556803', '2026-11-20 07:05:43.556805') ON CONFLICT DO NOTHING;

-- Data for table: users (4 rows)
INSERT INTO "users" ("institute_id", "login_id", "hashed_password", "role", "full_name", "email", "phone", "avatar_url", "is_active", "must_change_password", "last_login", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'ADM0001', '$2b$12$vlpRwdkSWImJisRf/Cakc.hSVB0CknLo52FVItqTrFjdNfIFzHpHy', 'admin', 'Admin (Vaishnavi Classes)', 'admin@vaishnaviclasses.com', '+91 98234 56780', NULL, 1, 0, NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', '2026-11-20 07:05:43.347558', '2026-11-20 12:53:35.393013') ON CONFLICT DO NOTHING;
INSERT INTO "users" ("institute_id", "login_id", "hashed_password", "role", "full_name", "email", "phone", "avatar_url", "is_active", "must_change_password", "last_login", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0001', '$2b$12$kkhObzYyITVb8uPsPYAeeeoiaugq.8czINwogt9/1weyVcxj3WhVG', 'student', 'pratham patel', '', '8858796809', NULL, 1, 1, NULL, 'ce6cc060-4c99-40c1-9ec5-87d4595aa131', '2026-11-20 13:02:29.758050', '2026-11-20 13:02:29.758058') ON CONFLICT DO NOTHING;
INSERT INTO "users" ("institute_id", "login_id", "hashed_password", "role", "full_name", "email", "phone", "avatar_url", "is_active", "must_change_password", "last_login", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0002', '$2b$12$Rlj.lfAliBrPo11y22LJp.cKk3cKPNtCfn9/9WH6Q/nJt/jbGLfWK', 'student', 'Rounak Bhagat', '', '7506023140', NULL, 1, 1, NULL, '5cddfef2-fbdd-4a30-a75e-06fe7d85ee98', '2026-11-26 10:39:04.656732', '2026-11-26 10:39:04.656765') ON CONFLICT DO NOTHING;
INSERT INTO "users" ("institute_id", "login_id", "hashed_password", "role", "full_name", "email", "phone", "avatar_url", "is_active", "must_change_password", "last_login", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0003', '$2b$12$A607cA1ohCApKAFmpVSm4OWt6nghLohhX4WsO7qq2osu7EbpNk.2a', 'student', 'gygy', '', '8885878958', NULL, 1, 1, NULL, '331fda77-5b7a-4b0f-a188-74e3ed18f8d4', '2026-11-26 14:14:12.458575', '2026-11-26 14:14:12.458581') ON CONFLICT DO NOTHING;

-- Data for table: student_profiles (3 rows)
INSERT INTO "student_profiles" ("user_id", "institute_id", "student_id", "dob", "gender", "guardian_name", "guardian_phone", "guardian_relation", "address", "admission_date", "status", "id", "created_at", "updated_at") VALUES ('ce6cc060-4c99-40c1-9ec5-87d4595aa131', '3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0001', NULL, 'other', 'Trishula Patel', '9664257346', 'Parent', NULL, '2026-11-20', 'active', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', '2026-11-20 13:02:29.769763', '2026-11-20 13:02:29.769770') ON CONFLICT DO NOTHING;
INSERT INTO "student_profiles" ("user_id", "institute_id", "student_id", "dob", "gender", "guardian_name", "guardian_phone", "guardian_relation", "address", "admission_date", "status", "id", "created_at", "updated_at") VALUES ('5cddfef2-fbdd-4a30-a75e-06fe7d85ee98', '3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0002', NULL, 'other', 'Rounak Bhagat', '7506023140', 'Parent', NULL, '2026-11-26', 'active', '9792cf4f-2d42-40cc-88e4-7ae385013867', '2026-11-26 10:39:04.681657', '2026-11-26 10:39:04.681674') ON CONFLICT DO NOTHING;
INSERT INTO "student_profiles" ("user_id", "institute_id", "student_id", "dob", "gender", "guardian_name", "guardian_phone", "guardian_relation", "address", "admission_date", "status", "id", "created_at", "updated_at") VALUES ('331fda77-5b7a-4b0f-a188-74e3ed18f8d4', '3395372a-42ae-4a38-8792-9b631ba0a825', 'STU0003', NULL, 'other', 'Trishula Patel', '8885878958', 'Parent', NULL, '2026-11-26', 'active', '81c7716d-8fc2-4c23-b266-a69995ddd8b3', '2026-11-26 14:14:12.467714', '2026-11-26 14:14:12.467716') ON CONFLICT DO NOTHING;

-- Data for table: fee_plans (1 rows)
INSERT INTO "fee_plans" ("institute_id", "course_id", "name", "description", "admission_fee", "tuition_fee", "examination_fee", "library_fee", "transport_fee", "custom_fee", "total_amount", "installment_frequency", "number_of_installments", "is_active", "id", "created_at", "updated_at", "discount_type", "discount_value", "discount_amount", "discount_reason") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', NULL, 'General Tuition & Admission Plan', 'Standard classes fee structure', 0, 2500, 0, 0, 0, 0, 2500, 'full', 1, 1, 'bcbc65e5-5c28-44bf-bb95-e473289a58ac', '2026-11-20 13:27:48.856969', '2026-11-20 13:27:48.856972', 'none', 0, 0, NULL) ON CONFLICT DO NOTHING;

-- Data for table: student_fee_assignments (2 rows)
INSERT INTO "student_fee_assignments" ("student_id", "fee_plan_id", "base_amount", "discount_amount", "scholarship_amount", "discount_reason", "scholarship_reason", "net_payable", "total_paid", "remaining_balance", "status", "id", "created_at", "updated_at", "original_fee_amount", "discount_type", "discount_value", "discount_applied_by", "discount_applied_at") VALUES ('c3ca1429-9400-4858-be9e-7fbca2f14b93', 'bcbc65e5-5c28-44bf-bb95-e473289a58ac', 2500, 0, 0, NULL, NULL, 2500, 2500, 0, 'paid', '39eb4eca-eab0-44ed-adff-1c89f2ac725a', '2026-11-20 13:27:48.858985', '2026-11-20 13:27:48.933908', 2500, 'none', 0, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "student_fee_assignments" ("student_id", "fee_plan_id", "base_amount", "discount_amount", "scholarship_amount", "discount_reason", "scholarship_reason", "net_payable", "total_paid", "remaining_balance", "status", "id", "created_at", "updated_at", "original_fee_amount", "discount_type", "discount_value", "discount_applied_by", "discount_applied_at") VALUES ('9792cf4f-2d42-40cc-88e4-7ae385013867', 'bcbc65e5-5c28-44bf-bb95-e473289a58ac', 2500, 10000, 0, '10%', NULL, -7500, 0, -7500, 'pending', '448238e4-9c8d-4c32-ad0c-2070916380fe', '2026-11-26 10:39:04.712391', '2026-11-26 10:39:04.712403', 2500, 'none', 0, NULL, NULL) ON CONFLICT DO NOTHING;

-- Data for table: installments (2 rows)
INSERT INTO "installments" ("fee_assignment_id", "installment_number", "title", "due_amount", "paid_amount", "due_date", "status", "id", "created_at", "updated_at") VALUES ('39eb4eca-eab0-44ed-adff-1c89f2ac725a', 1, 'Tuition & Admission Fee', 2500, 2500, '2026-11-20', 'paid', '99a09d59-bfd7-4272-ab87-de1f212ccc33', '2026-11-20 13:27:48.860062', '2026-11-20 13:27:48.938593') ON CONFLICT DO NOTHING;
INSERT INTO "installments" ("fee_assignment_id", "installment_number", "title", "due_amount", "paid_amount", "due_date", "status", "id", "created_at", "updated_at") VALUES ('448238e4-9c8d-4c32-ad0c-2070916380fe', 1, 'Installment 1 (Nov 2026)', -7500, 0, '2026-11-10', 'pending', '640df202-efc2-47b4-9391-9878419c708b', '2026-11-26 10:39:04.725624', '2026-11-26 10:39:04.725638') ON CONFLICT DO NOTHING;

-- Data for table: payments (1 rows)
INSERT INTO "payments" ("institute_id", "student_id", "collected_by_user_id", "amount", "payment_method", "transaction_ref", "proof_image_url", "payment_date", "status", "rejection_reason", "reversal_reason", "reversed_at", "notes", "id", "created_at", "updated_at", "recipient_upi_id", "recipient_upi_name") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 2500, 'cash', NULL, NULL, '2026-11-20', 'verified', NULL, NULL, NULL, 'First installment test', 'd5b0c727-4617-4678-9222-a971e5fd5726', '2026-11-20 13:27:48.863408', '2026-11-20 13:27:48.863410', NULL, NULL) ON CONFLICT DO NOTHING;

-- Data for table: payment_allocations (1 rows)
INSERT INTO "payment_allocations" ("payment_id", "installment_id", "allocated_amount", "id", "created_at", "updated_at") VALUES ('d5b0c727-4617-4678-9222-a971e5fd5726', '99a09d59-bfd7-4272-ab87-de1f212ccc33', 2500, 'a2586446-ad97-40b6-9778-ab0bd0abddb4', '2026-11-20 13:27:48.939314', '2026-11-20 13:27:48.939315') ON CONFLICT DO NOTHING;

-- Data for table: receipts (1 rows)
INSERT INTO "receipts" ("payment_id", "receipt_number", "amount_paid", "balance_after", "qr_code_data", "pdf_filename", "generated_at", "id", "created_at", "updated_at", "original_amount", "discount_amount", "final_payable", "signatory_name", "signatory_designation", "signature_image_path") VALUES ('d5b0c727-4617-4678-9222-a971e5fd5726', 'REC-2026-0001', 2500, 0, 'http://localhost:3000/verify-receipt/REC-2026-0001', 'REC-2026-0001.pdf', '2026-11-20 13:27:48.932636', '22084bc9-2f2b-413c-832c-9d7ee9486639', '2026-11-20 13:27:48.937074', '2026-11-20 13:27:48.937075', NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;

-- Data for table: reminders (90 rows)
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹7,500.00*
📅 *Due Date:* *30 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B97%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A30%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '7c34329c-f5d0-4f8c-b805-f44809420888', '2026-11-20 13:25:23.361655', '2026-11-20 13:25:23.361658') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹7,500.00*
📅 *Due Date:* *30 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B97%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A30%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '96e4872e-38ba-43df-9a51-0f96267eeac5', '2026-11-20 13:25:55.258745', '2026-11-20 13:25:55.258748') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹7,500.00*
📅 *Due Date:* *30 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B97%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A30%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '211c9ad1-bdac-447c-90b7-621a7601a78b', '2026-11-20 13:26:33.135060', '2026-11-20 13:26:33.135063') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹7,500.00*
📅 *Due Date:* *30 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B97%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A30%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '0d42a3a4-c1e0-453b-bdfd-7b2ca2f602bb', '2026-11-20 13:27:26.559889', '2026-11-20 13:27:26.559892') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹7,500.00*
📅 *Due Date:* *30 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B97%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A30%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '83535eda-0af7-4bd4-bda6-1e2465767e1e', '2026-11-20 13:27:48.840638', '2026-11-20 13:27:48.840641') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'b517e838-a3a0-4f5d-9215-8a386c94c791', '2026-11-20 13:40:43.771013', '2026-11-20 13:40:43.771018') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '25e1f77d-018e-4a87-9165-d7a3be023ed1', '2026-11-20 13:42:47.659752', '2026-11-20 13:42:47.659772') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '3f5c16e3-6601-45fa-b3e3-0ca446c643e4', '2026-11-20 13:49:44.977379', '2026-11-20 13:49:44.977385') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹0.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B90.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '79921838-5d76-4dd6-8aa8-228888cce8a1', '2026-11-20 13:49:48.092990', '2026-11-20 13:49:48.092995') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹5.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '6f0745d1-32d3-485c-b6b0-7fc72d6b9433', '2026-11-20 13:49:50.567454', '2026-11-20 13:49:50.567458') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹50.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B950.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '43a21f6d-fd7e-4c49-a874-11b73c99c224', '2026-11-20 13:49:50.884795', '2026-11-20 13:49:50.884802') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹500.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B9500.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '5502a41a-12a0-4a01-bf7b-cc3fea9d91e8', '2026-11-20 13:49:51.032332', '2026-11-20 13:49:51.032335') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7cc60df0-5ddc-49bd-8ff1-0bb8a7fb8dc7', '2026-11-20 13:49:51.799295', '2026-11-20 13:49:51.799299') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (2)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%282%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '07c8ebe5-8c91-4266-b9d3-f9c316db3ecb', '2026-11-20 13:49:56.150944', '2026-11-20 13:49:56.150951') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'ca8c70fc-832e-4dd6-9010-d649c60de19e', '2026-11-20 13:49:56.594630', '2026-11-20 13:49:56.594634') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (2)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%282%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '075f1f25-1034-4dea-9e11-5c9de0c210b6', '2026-11-20 13:50:03.728087', '2026-11-20 13:50:03.728091') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (20 Nov 2026)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2820%20Nov%202026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '56b12ed7-0860-4e53-bf5b-7360e3edeb3f', '2026-11-20 13:50:04.008430', '2026-11-20 13:50:04.008434') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (2)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%282%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '4df0fdad-1238-41d2-a531-325641bff8de', '2026-11-20 13:50:05.540165', '2026-11-20 13:50:05.540172') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'fce612b4-4eec-48b0-b24b-926ee7ccbeae', '2026-11-20 13:50:05.723146', '2026-11-20 13:50:05.723154') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '2308474b-f54d-4096-9439-1c8bc8174287', '2026-11-20 13:50:06.493417', '2026-11-20 13:50:06.493421') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/1)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/1%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7759c598-3d55-4d45-9a6e-bb1182a82c90', '2026-11-20 13:50:07.836901', '2026-11-20 13:50:07.836909') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'bea05c84-7b33-4d7a-a3ac-afe371c744d6', '2026-11-20 13:50:08.013407', '2026-11-20 13:50:08.013412') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '9a861edc-ae6e-43dc-81fa-0d5f63656dd6', '2026-11-20 13:50:08.818641', '2026-11-20 13:50:08.818645') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/2)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/2%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'b25540b7-a420-480c-9fce-1ce21725edf6', '2026-11-20 13:50:09.193936', '2026-11-20 13:50:09.193942') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/20)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/20%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'ee4aa6bd-096a-4da3-9038-5c087c15122b', '2026-11-20 13:50:09.399531', '2026-11-20 13:50:09.399547') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/202)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/202%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'ff3af44c-5b5c-4be3-8550-e11291ca46f4', '2026-11-20 13:50:09.600965', '2026-11-20 13:50:09.600973') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/2026)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/2026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '8ae15173-d5d8-4db1-8125-708ea02b76a9', '2026-11-20 13:50:09.762331', '2026-11-20 13:50:09.762335') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/2026)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/2026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '1bd9032f-4aa3-4847-a02f-71a07756b4a3', '2026-11-20 13:50:32.378468', '2026-11-20 13:50:32.378472') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'due_today', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *FEE DUE TODAY NOTICE*

Dear Student / Parent of *pratham patel*,

Your fee installment for *Vaishnavi Classes* is *DUE TODAY (21/11/2026)*:

💰 *Amount Due:* *₹5,000.00*

💳 *Pay Instantly via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Cash / Counter Payment:*
Please visit the *Vaishnavi Classes* office counter today to complete the payment.

Thank you,
*Accounts Desk — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9A%A0%EF%B8%8F%20%2AFEE%20DUE%20TODAY%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20is%20%2ADUE%20TODAY%20%2821/11/2026%29%2A%3A%0A%0A%F0%9F%92%B0%20%2AAmount%20Due%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Instantly%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2ACash%20/%20Counter%20Payment%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20counter%20today%20to%20complete%20the%20payment.%0A%0AThank%20you%2C%0A%2AAccounts%20Desk%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', 'df482624-8a72-476b-a9ab-8c0e7f96c77f', '2026-11-20 13:50:42.196137', '2026-11-20 13:50:42.196142') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '1f870ccd-f51b-4d23-b561-126145c6fb28', '2026-11-20 14:28:13.293999', '2026-11-20 14:28:13.294004') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '276bd572-87be-4f2c-bfab-76674627c2a0', '2026-11-20 14:28:25.573622', '2026-11-20 14:28:25.573629') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'e70c8e1b-04d0-4e78-b205-dafdfcc2dcbc', '2026-11-20 14:39:03.677995', '2026-11-20 14:39:03.678000') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7a9f1a6d-c411-4ced-b653-63c5f94f9a43', '2026-11-20 14:39:08.103563', '2026-11-20 14:39:08.103568') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹50.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B950.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '4b5f6415-9ac4-40e5-9f48-b680ca52fb6e', '2026-11-20 14:39:08.403197', '2026-11-20 14:39:08.403210') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹500.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B9500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'a71c9c72-ad67-4f8d-9e79-be0c88fbee95', '2026-11-20 14:39:08.572406', '2026-11-20 14:39:08.572413') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '88744b5e-bb67-4acd-8cca-7b1b15853772', '2026-11-20 14:39:09.104184', '2026-11-20 14:39:09.104188') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *2*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A2%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'edc9e7f3-1139-42f7-8cf8-0222687ddd5d', '2026-11-20 14:39:11.537277', '2026-11-20 14:39:11.537286') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '23866344-05c4-49b1-8a10-958423bae67e', '2026-11-20 14:39:12.062567', '2026-11-20 14:39:12.062571') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *218*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A218%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '2cb4e357-cf7c-48de-9f46-dbbc83ab8640', '2026-11-20 14:39:13.077458', '2026-11-20 14:39:13.077467') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'c6203d35-76de-415d-af6f-b63a088c3873', '2026-11-20 14:39:14.297912', '2026-11-20 14:39:14.297924') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '8143f646-874c-47fc-bd48-eb1884de4c80', '2026-11-20 14:39:14.602454', '2026-11-20 14:39:14.602458') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/1*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/1%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '63650710-2829-425c-8259-e231d66b5ea8', '2026-11-20 14:39:14.968221', '2026-11-20 14:39:14.968225') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'aa1bf77e-81e8-460c-bead-9e67ac54c306', '2026-11-20 14:39:15.213789', '2026-11-20 14:39:15.213794') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '9a260b76-e420-4c03-badd-5e06a9ac3341', '2026-11-20 14:39:16.472581', '2026-11-20 14:39:16.472591') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/2*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/2%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '67da425d-440d-415a-979c-e1a7dd16694e', '2026-11-20 14:39:16.994921', '2026-11-20 14:39:16.994928') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/20*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/20%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '5c216292-b812-4f7c-9788-a569f461d180', '2026-11-20 14:39:17.263817', '2026-11-20 14:39:17.263851') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/202*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/202%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'ea05c5cd-1df7-41a9-9b63-6d9c95239183', '2026-11-20 14:39:17.458601', '2026-11-20 14:39:17.458608') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/2026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'bae67df4-9749-4ce3-9e8f-99fe15d11c5e', '2026-11-20 14:39:17.619696', '2026-11-20 14:39:17.619700') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10/2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10/2026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'delivered', '4bd8a922-aa54-49e0-a88a-cfbc81cbf6bc', '2026-11-20 14:39:31.699202', '2026-11-20 14:39:31.699208') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'a32e2d18-75ed-4b51-a72a-dada7480983b', '2026-11-20 14:50:15.647675', '2026-11-20 14:50:15.647679') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '724ec0d4-177c-427a-acc4-a5f36472343d', '2026-11-20 14:50:18.844300', '2026-11-20 14:50:18.844304') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹50.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B950.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'b6f46d7b-0d86-46b4-b08b-b550337f3681', '2026-11-20 14:50:19.145621', '2026-11-20 14:50:19.145625') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹500.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B9500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '98e54872-4ef2-424e-b846-75bf1bc9da94', '2026-11-20 14:50:19.342900', '2026-11-20 14:50:19.342904') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *20 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A20%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '666c8af7-2849-4978-a377-49344eea03ef', '2026-11-20 14:50:19.665701', '2026-11-20 14:50:19.665705') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *2*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A2%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'c03e38cb-1591-46a6-ae52-d9f37109e359', '2026-11-20 14:50:22.001349', '2026-11-20 14:50:22.001355') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '42281c11-4cf8-4373-80b6-f4a951a2acff', '2026-11-20 14:50:22.205798', '2026-11-20 14:50:22.205801') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '6c6a902a-a4c7-45af-bb61-10487bb1eec8', '2026-11-20 14:50:22.770652', '2026-11-20 14:50:22.770657') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/1*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/1%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '01f65155-0136-47b5-8798-8ab99ad8d315', '2026-11-20 14:50:23.156077', '2026-11-20 14:50:23.156081') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/10*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/10%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '638b60c4-8224-4c6d-bf8c-0c9f391feed0', '2026-11-20 14:50:23.399503', '2026-11-20 14:50:23.399514') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/1*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/1%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '75ac88d0-c003-457d-adee-871638a84f50', '2026-11-20 14:50:24.408180', '2026-11-20 14:50:24.408184') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '80cd26ec-1013-4854-a93e-4c3f9d9393f7', '2026-11-20 14:50:24.831198', '2026-11-20 14:50:24.831207') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'b3226572-f47a-4343-a60d-8d5699020cc3', '2026-11-20 14:50:26.358235', '2026-11-20 14:50:26.358243') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/2*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/2%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '01685d5c-d9ea-4853-87d9-8f937a5f2906', '2026-11-20 14:50:26.763148', '2026-11-20 14:50:26.763154') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/20*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/20%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '9c0e4235-ca81-4255-aa48-d0c2ded1bbaf', '2026-11-20 14:50:26.998819', '2026-11-20 14:50:26.998823') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/202*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/202%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'a60a22b4-34d5-404b-b4d2-ededa48ef092', '2026-11-20 14:50:27.195029', '2026-11-20 14:50:27.195033') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/2026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '31ed2b07-5948-41fc-9dd2-daa0bab556f9', '2026-11-20 14:50:27.412200', '2026-11-20 14:50:27.412211') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹5,000.00*
📅 *Due Date:* *21/11/2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21/11/2026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7c3b246b-7319-4448-ae70-6bf305491201', '2026-11-20 14:50:29.497432', '2026-11-20 14:50:29.497437') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *pratham patel*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹0.00*
📅 *Due Date:* *21 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A21%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '27f8ec22-9b29-47bc-9e96-729ef0e037f6', '2026-11-20 18:32:15.038616', '2026-11-20 18:32:15.038630') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'payment_confirmation', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
✅ *FEE PAYMENT CONFIRMATION RECEIPT*

Dear Student / Parent of *pratham patel*,

We gratefully acknowledge the receipt of your fee payment at *Vaishnavi Classes*:

💵 *Amount Received:* *₹0.00*
📅 *Payment Date:* *26 Nov 2026*

Your official verified digital receipt has been generated. You can download it directly from your student portal.

Thank you for your prompt payment!

Best regards,
*Management & Accounts — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9C%85%20%2AFEE%20PAYMENT%20CONFIRMATION%20RECEIPT%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AWe%20gratefully%20acknowledge%20the%20receipt%20of%20your%20fee%20payment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B5%20%2AAmount%20Received%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2APayment%20Date%3A%2A%20%2A26%20Nov%202026%2A%0A%0AYour%20official%20verified%20digital%20receipt%20has%20been%20generated.%20You%20can%20download%20it%20directly%20from%20your%20student%20portal.%0A%0AThank%20you%20for%20your%20prompt%20payment%21%0A%0ABest%20regards%2C%0A%2AManagement%20%26%20Accounts%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '8833b7d2-654a-4704-bd2e-fc1c52dff14a', '2026-11-26 09:53:12.805397', '2026-11-26 09:53:12.805403') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'payment_confirmation', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
✅ *FEE PAYMENT CONFIRMATION RECEIPT*

Dear Student / Parent of *pratham patel*,

We gratefully acknowledge the receipt of your fee payment at *Vaishnavi Classes*:

💵 *Amount Received:* *₹0.00*
📅 *Payment Date:* *26 Nov 2026*

Your official verified digital receipt has been generated. You can download it directly from your student portal.

Thank you for your prompt payment!

Best regards,
*Management & Accounts — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9C%85%20%2AFEE%20PAYMENT%20CONFIRMATION%20RECEIPT%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AWe%20gratefully%20acknowledge%20the%20receipt%20of%20your%20fee%20payment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B5%20%2AAmount%20Received%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2APayment%20Date%3A%2A%20%2A26%20Nov%202026%2A%0A%0AYour%20official%20verified%20digital%20receipt%20has%20been%20generated.%20You%20can%20download%20it%20directly%20from%20your%20student%20portal.%0A%0AThank%20you%20for%20your%20prompt%20payment%21%0A%0ABest%20regards%2C%0A%2AManagement%20%26%20Accounts%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '47be9635-7822-4bab-8cc9-194ed653670f', '2026-11-26 09:53:14.702384', '2026-11-26 09:53:14.702388') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *10 Nov 2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹-7,500.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A10%20Nov%202026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B9-7%2C500.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '99130bb4-35ca-43ec-a13e-32a879aa070d', '2026-11-26 10:39:46.752175', '2026-11-26 10:39:46.752180') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26 Nov 2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26%20Nov%202026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '1fb48f54-1e93-474c-8cee-c72c862cfdf5', '2026-11-26 10:39:51.265505', '2026-11-26 10:39:51.265509') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26 Nov 2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹50.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26%20Nov%202026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B950.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '89aa79fe-ed80-4b99-9735-1bcf6368784d', '2026-11-26 10:39:51.698141', '2026-11-26 10:39:51.698151') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26 Nov 2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹500.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26%20Nov%202026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B9500.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '0d5e3299-16e7-4d4f-8ae7-cf965ceb48e1', '2026-11-26 10:39:51.976047', '2026-11-26 10:39:51.976074') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26 Nov 2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26%20Nov%202026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '53197147-11ba-4d9b-b3f8-e0583dae3dd8', '2026-11-26 10:39:52.398170', '2026-11-26 10:39:52.398182') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *2* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A2%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '4ff2fca5-ff32-4197-8317-5d6491c990c6', '2026-11-26 10:39:55.343870', '2026-11-26 10:39:55.343874') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7b5c3843-3ae2-4196-b529-7082e3bb1bf0', '2026-11-26 10:39:55.574572', '2026-11-26 10:39:55.574578') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'ba59ffdc-93ab-4473-bba5-2cd23be9cbc5', '2026-11-26 10:39:56.974412', '2026-11-26 10:39:56.974416') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/1* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/1%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '7978d484-cae7-44c1-9706-3f8800afb622', '2026-11-26 10:39:58.418106', '2026-11-26 10:39:58.418110') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '2372d951-3db2-4512-9796-8d23a554ee8c', '2026-11-26 10:40:01.483544', '2026-11-26 10:40:01.483551') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'bb7beb67-846e-4eba-894f-10e5d0eafb67', '2026-11-26 10:40:02.493236', '2026-11-26 10:40:02.493240') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/2* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/2%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '047bf246-79ff-4125-a63a-9e7e722f9357', '2026-11-26 10:40:02.931206', '2026-11-26 10:40:02.931210') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/20* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/20%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'cb4e6995-244d-49c9-8ff5-410335a2e6f8', '2026-11-26 10:40:03.697269', '2026-11-26 10:40:03.697282') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/202* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/202%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'd582a028-2dd6-4315-a585-e2af0acc1ac5', '2026-11-26 10:40:04.015457', '2026-11-26 10:40:04.015470') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
*Administration — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/2026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A%2AAdministration%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '3c4d23bf-efe8-44ea-96c0-e3dfa9515585', '2026-11-26 10:40:04.182833', '2026-11-26 10:40:04.182841') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', '640df202-efc2-47b4-9391-9878419c708b', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'overdue_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
🚨 *URGENT: OVERDUE FEE NOTICE*

Dear Student / Parent of *Rounak Bhagat*,

Your fee installment for *Vaishnavi Classes* was due on *26/11/2026* and is now *OVERDUE*:

⚠️ *Pending Overdue Amount:* *₹5,000.00*

💳 *Pay Immediately via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Office Visit:*
Please visit the *Vaishnavi Classes* office immediately to settle the outstanding balance.

Regards,
- Vaishnavi Classes
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%9A%A8%20%2AURGENT%3A%20OVERDUE%20FEE%20NOTICE%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AYour%20fee%20installment%20for%20%2AVaishnavi%20Classes%2A%20was%20due%20on%20%2A26/11/2026%2A%20and%20is%20now%20%2AOVERDUE%2A%3A%0A%0A%E2%9A%A0%EF%B8%8F%20%2APending%20Overdue%20Amount%3A%2A%20%2A%E2%82%B95%2C000.00%2A%0A%0A%F0%9F%92%B3%20%2APay%20Immediately%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffice%20Visit%3A%2A%0APlease%20visit%20the%20%2AVaishnavi%20Classes%2A%20office%20immediately%20to%20settle%20the%20outstanding%20balance.%0A%0ARegards%2C%0A-%20Vaishnavi%20Classes%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '95362949-12af-4258-9119-0e01906d5e7e', '2026-11-26 10:40:49.767174', '2026-11-26 10:40:49.767179') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *Rounak Bhagat*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹-7,500.00*
📅 *Due Date:* *26 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B9-7%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A26%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', '592717b6-4608-4661-96f8-fef33e562fa5', '2026-11-26 11:01:26.905895', '2026-11-26 11:01:26.905900') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9792cf4f-2d42-40cc-88e4-7ae385013867', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'upcoming_fee', '7506023140', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
📢 *FEE PAYMENT REMINDER*

Dear Student / Parent of *Rounak Bhagat*,

This is a gentle reminder regarding the fee installment at *Vaishnavi Classes*:

💰 *Due Amount:* *₹-7,500.00*
📅 *Due Date:* *26 Nov 2026*

💳 *Pay via UPI:*
UPI ID: `vaishnaviclasses@upi`

🏛️ *Offline Payment Desk:*
You can also pay directly in cash or cheque at *Vaishnavi Classes* office counter.

Kindly clear the dues on or before the due date.

Thank you,
*Accounts Office — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/917506023140?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%F0%9F%93%A2%20%2AFEE%20PAYMENT%20REMINDER%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2ARounak%20Bhagat%2A%2C%0A%0AThis%20is%20a%20gentle%20reminder%20regarding%20the%20fee%20installment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B0%20%2ADue%20Amount%3A%2A%20%2A%E2%82%B9-7%2C500.00%2A%0A%F0%9F%93%85%20%2ADue%20Date%3A%2A%20%2A26%20Nov%202026%2A%0A%0A%F0%9F%92%B3%20%2APay%20via%20UPI%3A%2A%0AUPI%20ID%3A%20%60vaishnaviclasses%40upi%60%0A%0A%F0%9F%8F%9B%EF%B8%8F%20%2AOffline%20Payment%20Desk%3A%2A%0AYou%20can%20also%20pay%20directly%20in%20cash%20or%20cheque%20at%20%2AVaishnavi%20Classes%2A%20office%20counter.%0A%0AKindly%20clear%20the%20dues%20on%20or%20before%20the%20due%20date.%0A%0AThank%20you%2C%0A%2AAccounts%20Office%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'b3cf8ffe-1063-4e74-bd40-bf05b32667e1', '2026-11-26 11:01:31.511819', '2026-11-26 11:01:31.511826') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'payment_confirmation', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
✅ *FEE PAYMENT CONFIRMATION RECEIPT*

Dear Student / Parent of *pratham patel*,

We gratefully acknowledge the receipt of your fee payment at *Vaishnavi Classes*:

💵 *Amount Received:* *₹0.00*
📅 *Payment Date:* *27 Nov 2026*

Your official verified digital receipt has been generated. You can download it directly from your student portal.

Thank you for your prompt payment!

Best regards,
*Management & Accounts — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9C%85%20%2AFEE%20PAYMENT%20CONFIRMATION%20RECEIPT%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AWe%20gratefully%20acknowledge%20the%20receipt%20of%20your%20fee%20payment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B5%20%2AAmount%20Received%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2APayment%20Date%3A%2A%20%2A27%20Nov%202026%2A%0A%0AYour%20official%20verified%20digital%20receipt%20has%20been%20generated.%20You%20can%20download%20it%20directly%20from%20your%20student%20portal.%0A%0AThank%20you%20for%20your%20prompt%20payment%21%0A%0ABest%20regards%2C%0A%2AManagement%20%26%20Accounts%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'e20ba1c3-4d81-4d01-ba91-5f5c90b1c599', '2026-11-27 06:45:49.131953', '2026-11-27 06:45:49.131958') ON CONFLICT DO NOTHING;
INSERT INTO "reminders" ("institute_id", "student_id", "installment_id", "sent_by_user_id", "template_type", "recipient_phone", "message_text", "whatsapp_url", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'c3ca1429-9400-4858-be9e-7fbca2f14b93', NULL, '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'payment_confirmation', '9664257346', '🏛️ *VAISHNAVI CLASSES*
━━━━━━━━━━━━━━━━━━━━━━
✅ *FEE PAYMENT CONFIRMATION RECEIPT*

Dear Student / Parent of *pratham patel*,

We gratefully acknowledge the receipt of your fee payment at *Vaishnavi Classes*:

💵 *Amount Received:* *₹0.00*
📅 *Payment Date:* *27 Nov 2026*

Your official verified digital receipt has been generated. You can download it directly from your student portal.

Thank you for your prompt payment!

Best regards,
*Management & Accounts — Vaishnavi Classes*
━━━━━━━━━━━━━━━━━━━━━━', 'https://wa.me/919664257346?text=%F0%9F%8F%9B%EF%B8%8F%20%2AVAISHNAVI%20CLASSES%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%0A%E2%9C%85%20%2AFEE%20PAYMENT%20CONFIRMATION%20RECEIPT%2A%0A%0ADear%20Student%20/%20Parent%20of%20%2Apratham%20patel%2A%2C%0A%0AWe%20gratefully%20acknowledge%20the%20receipt%20of%20your%20fee%20payment%20at%20%2AVaishnavi%20Classes%2A%3A%0A%0A%F0%9F%92%B5%20%2AAmount%20Received%3A%2A%20%2A%E2%82%B90.00%2A%0A%F0%9F%93%85%20%2APayment%20Date%3A%2A%20%2A27%20Nov%202026%2A%0A%0AYour%20official%20verified%20digital%20receipt%20has%20been%20generated.%20You%20can%20download%20it%20directly%20from%20your%20student%20portal.%0A%0AThank%20you%20for%20your%20prompt%20payment%21%0A%0ABest%20regards%2C%0A%2AManagement%20%26%20Accounts%20%E2%80%94%20Vaishnavi%20Classes%2A%0A%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81', 'generated', 'bbd4b3f6-3d6a-4129-9545-86a846d32203', '2026-11-27 06:45:50.754267', '2026-11-27 06:45:50.754280') ON CONFLICT DO NOTHING;

-- Data for table: enquiries (1 rows)
INSERT INTO "enquiries" ("institute_id", "customer_name", "mobile_number", "email", "service_type", "message", "source", "status", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'Amit Kumar', '9876543210', 'amit@gmail.com', 'Class 10th Board Preparation', 'Want admission details for 2026-27 batch', 'Website Contact Form', 'pending', 'aa605088-5a29-4bc6-b6a6-1d802b08c3a7', '2026-11-20 14:00:20.248512', '2026-11-20 14:00:20.248515') ON CONFLICT DO NOTHING;

-- Data for table: notifications (1 rows)
INSERT INTO "notifications" ("user_id", "title", "message", "notification_type", "is_read", "action_url", "id", "created_at", "updated_at") VALUES ('9caeec07-70b2-4532-94cd-5c759bbdfdef', 'New Website Enquiry Received', 'Amit Kumar (9876543210) enquired for Class 10th Board Preparation', 'alert', 0, '/admin/enquiries', '49ca8231-5a97-4001-9375-1a9237ce4b2a', '2026-11-20 14:00:20.253881', '2026-11-20 14:00:20.253884') ON CONFLICT DO NOTHING;

-- Data for table: conversations (2 rows)
INSERT INTO "conversations" ("institute_id", "title", "is_direct", "last_message_at", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', 'Vaishnavi Classes — Campus Notice & Chat Channel', 0, '2026-11-20 14:49:58.545492', 'f5cf01b9-2c75-40b5-9976-5c10271297dd', '2026-11-20 14:45:43.224781', '2026-11-20 14:49:58.548037') ON CONFLICT DO NOTHING;
INSERT INTO "conversations" ("institute_id", "title", "is_direct", "last_message_at", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', NULL, 1, '2026-11-20 14:50:09.249559', '611cdf09-3be1-4f9c-ba6d-40c54f8a6e5d', '2026-11-20 14:50:04.358745', '2026-11-20 14:50:09.250592') ON CONFLICT DO NOTHING;

-- Data for table: conversation_members (3 rows)
INSERT INTO "conversation_members" ("conversation_id", "user_id", "last_read_at", "id", "created_at", "updated_at") VALUES ('f5cf01b9-2c75-40b5-9976-5c10271297dd', '9caeec07-70b2-4532-94cd-5c759bbdfdef', '2026-11-20 14:45:43.229203', '53e61f71-1b78-4de6-9b53-ca80d136f68e', '2026-11-20 14:45:43.229236', '2026-11-20 14:45:43.229239') ON CONFLICT DO NOTHING;
INSERT INTO "conversation_members" ("conversation_id", "user_id", "last_read_at", "id", "created_at", "updated_at") VALUES ('611cdf09-3be1-4f9c-ba6d-40c54f8a6e5d', '9caeec07-70b2-4532-94cd-5c759bbdfdef', '2026-11-20 14:50:04.369295', '7a57d651-7009-4d3b-9646-a5d8f9a0194b', '2026-11-20 14:50:04.369321', '2026-11-20 14:50:04.369324') ON CONFLICT DO NOTHING;
INSERT INTO "conversation_members" ("conversation_id", "user_id", "last_read_at", "id", "created_at", "updated_at") VALUES ('611cdf09-3be1-4f9c-ba6d-40c54f8a6e5d', 'ce6cc060-4c99-40c1-9ec5-87d4595aa131', '2026-11-20 14:50:04.369326', 'e72c534a-d4f6-4375-9953-4d01dc4ba6b9', '2026-11-20 14:50:04.369334', '2026-11-20 14:50:04.369336') ON CONFLICT DO NOTHING;

-- Data for table: messages (4 rows)
INSERT INTO "messages" ("conversation_id", "sender_id", "content", "is_read", "id", "created_at", "updated_at") VALUES ('f5cf01b9-2c75-40b5-9976-5c10271297dd', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'Welcome to the Vaishnavi Classes Real-Time Discussion Portal! Send your queries or fee updates here.', 1, 'eba67c2f-c40c-4ef8-967b-0769eea5154b', '2026-11-20 14:45:43.231784', '2026-11-20 14:45:43.231788') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("conversation_id", "sender_id", "content", "is_read", "id", "created_at", "updated_at") VALUES ('f5cf01b9-2c75-40b5-9976-5c10271297dd', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'hii', 0, '54fa3763-c4fb-40c8-9999-8ddd78a76fdb', '2026-11-20 14:49:58.554413', '2026-11-20 14:49:58.554423') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("conversation_id", "sender_id", "content", "is_read", "id", "created_at", "updated_at") VALUES ('611cdf09-3be1-4f9c-ba6d-40c54f8a6e5d', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'Hello pratham patel, starting communication from Vaishnavi Classes chat portal.', 0, 'c2ff93f6-1319-405d-88bf-5376ff540f86', '2026-11-20 14:50:04.370545', '2026-11-20 14:50:04.370549') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("conversation_id", "sender_id", "content", "is_read", "id", "created_at", "updated_at") VALUES ('611cdf09-3be1-4f9c-ba6d-40c54f8a6e5d', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'hii', 0, '0d6c18c1-137d-4acb-b777-217e3cdf7e86', '2026-11-20 14:50:09.253367', '2026-11-20 14:50:09.253372') ON CONFLICT DO NOTHING;

-- Data for table: audit_logs (1 rows)
INSERT INTO "audit_logs" ("institute_id", "user_id", "action", "target_type", "target_id", "details", "ip_address", "id", "created_at", "updated_at") VALUES ('3395372a-42ae-4a38-8792-9b631ba0a825', '9caeec07-70b2-4532-94cd-5c759bbdfdef', 'PAYMENT_RECORDED', 'payment', 'd5b0c727-4617-4678-9222-a971e5fd5726', '{"amount": 2500.0, "receipt_number": "REC-2026-0001", "method": "cash", "student_id": "STU0001"}', NULL, '91bec880-8a3f-4b25-87e4-c43dc1ad8c38', '2026-11-20 13:27:48.935602', '2026-11-20 13:27:48.935604') ON CONFLICT DO NOTHING;

SET session_replication_role = 'DEFAULT';

-- Migration completed successfully!
