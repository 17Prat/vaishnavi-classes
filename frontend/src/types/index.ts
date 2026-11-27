export type UserRole = "admin" | "staff" | "student";

export interface User {
  id: string;
  institute_id: string;
  login_id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  must_change_password: boolean;
  permissions?: {
    can_collect_fees?: boolean;
    can_verify_upi?: boolean;
    can_send_reminders?: boolean;
    can_view_reports?: boolean;
    can_manage_students?: boolean;
  };
  student_profile_id?: string;
  staff_profile_id?: string;
  institute_name?: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  login_id?: string;
  full_name: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
  address?: string;
  admission_date: string;
  status: "active" | "inactive" | "graduated";
  course_name?: string;
  class_name?: string;
  batch_name?: string;
  batch_id?: string;
  total_fee: number;
  total_paid: number;
  remaining_balance: number;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  staff_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  designation: string;
  qualification?: string;
  joining_date: string;
  status: "active" | "inactive";
  permissions: {
    can_collect_fees: boolean;
    can_verify_upi: boolean;
    can_send_reminders: boolean;
    can_view_reports: boolean;
    can_manage_students: boolean;
  };
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  duration_months: number;
}

export interface Batch {
  id: string;
  class_id: string;
  name: string;
  code: string;
  max_capacity: number;
  subject?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  batch_days?: string;
  assigned_staff_name?: string;
  description?: string;
  status?: string;
  class_name?: string;
  course_name?: string;
}

export interface FeePlan {
  id: string;
  course_id?: string;
  course_name?: string;
  name: string;
  description?: string;
  admission_fee: number;
  tuition_fee: number;
  examination_fee: number;
  library_fee: number;
  transport_fee: number;
  custom_fee: number;
  total_amount: number;
  installment_frequency: string;
  number_of_installments: number;
  is_active: boolean;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  discount_reason?: string;
}

export interface Installment {
  id: string;
  installment_number: number;
  title: string;
  due_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  status: "pending" | "partial" | "paid" | "overdue";
}

export interface FeeLedger {
  assignment_id: string;
  student_id: string;
  student_name: string;
  login_id: string;
  fee_plan_name: string;
  base_amount: number;
  original_fee_amount?: number;
  admission_fee: number;
  tuition_fee: number;
  examination_fee: number;
  library_fee: number;
  transport_fee: number;
  custom_fee: number;
  discount_type?: string;
  discount_value?: number;
  discount_amount: number;
  discount_reason?: string;
  scholarship_amount: number;
  net_payable: number;
  total_paid: number;
  remaining_balance: number;
  status: string;
  installments: Installment[];
}

export interface UpiAccount {
  id: string;
  institute_id: string;
  account_holder_name: string;
  upi_id: string;
  display_name?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SignatureSettings {
  signatory_name: string;
  signatory_designation: string;
  signature_image_path?: string;
  signature_data_url?: string;
  signature_enabled: boolean;
  signature_version: number;
}

export interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  student_login_id: string;
  course_name?: string;
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  payment_date: string;
  status: "verified" | "pending_verification" | "rejected" | "reversed";
  collected_by?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  amount_paid: number;
  balance_after: number;
  qr_code_data: string;
  pdf_url: string;
  generated_at: string;
  student_name?: string;
  student_id?: string;
  payment_method?: string;
  institute_name?: string;
}

export interface DashboardSummary {
  total_students: number;
  total_staff: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  total_overdue: number;
  today_collected: number;
  monthly_collected: number;
  collection_rate_percentage: number;
  pending_verifications_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  is_direct: boolean;
  participant_names: string[];
  participant_ids: string[];
  last_message?: string;
  last_message_at: string;
  unread_count: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
