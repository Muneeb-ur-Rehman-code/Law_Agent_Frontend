export interface User {
  id: string;
  email: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'intake';
  first_name: string;
  last_name: string;
  practice_area: 'PI' | 'lemon_law' | 'both';
  is_active?: boolean;
  created_at?: string | null;
  last_login?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Case {
  id: number;
  title: string;
  description?: string;
  case_number: number;
  court_case_number?: string;
  case_type?: string;
  last_date_to_file_claim?: string; // statute deadline
  filed_on?: string;
  loss_date?: string;
  closed_date?: string | null;
  inserted_on?: string;
  bill_type?: string;
}

export interface CaseClient {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  mobile_phone?: string;
  home_phone?: string;
  office_phone?: string;
  home_address?: string;
  office_address?: string;
  medical_provider?: string;
}

export interface CaseNote {
  id: number;
  title: string;
  text: string;
  read: number;
  reminder_time?: string;
  created_at?: string;
  staff_first_name?: string;
  staff_last_name?: string;
}

export interface CaseDoc {
  id: number;
  name: string;
  server_name: string;
  mime_type?: string;
  ext?: string;
  size?: number;
}

export interface CaseTask {
  id: number;
  title: string;
  text?: string;
  deadline?: string;
  row_key?: number;
  table_name?: string;
  staff_first_name?: string;
  staff_last_name?: string;
}

export interface SingleCaseDetail {
  case: Case;
  clients: CaseClient[];
  notes: CaseNote[];
  documents: CaseDoc[];
  tasks: CaseTask[];
}

export interface PendingApproval {
  id: string;
  case_id: number;
  agent_name: string;
  action_summary: string;
  document_url: string | null;
  priority: 'routine' | 'urgent' | 'critical';
  created_at: string;
  thread_id?: string;
  deadline_date?: string;
  days_remaining?: number;
  preview_content?: string;
  document_type?: string;
  client_name?: string;
  provider_name?: string;
  days_since_update?: number;
  case_title?: string;
  threshold_status?: 'not_met' | 'met_demand_ready' | 'demand_sent';
  research_findings?: string;
  citations?: ResearchCitation[];
  research_query?: string;
  message?: string;
  days_since_last_update?: number;
}

export interface AdminUser extends User {
  id: string;
  is_active: boolean;
}

export interface SearchResult {
  cases: Array<{ id: number; title: string; case_number?: string | number; case_type?: string }>;
  clients: Array<{ id: number; first_name: string; last_name: string; case_id?: number }>;
}

export interface ResearchCitation {
  citation: string;
  verified: boolean;
  note?: string;
}

export interface LemonLawStatus {
  case_id: number;
  threshold_status: 'not_met' | 'met_demand_ready' | 'demand_sent';
  repair_attempts: number | null;
  days_out_of_service: number | null;
  manufacturer_name: string | null;
  last_manufacturer_communication: string | null;
}

export interface MedicalStatus {
  case_id: number;
  providers: string[];
  days_since_update: number | null;
  status: 'ok' | 'follow_up_needed' | 'overdue' | 'unknown';
  last_monitoring_check: string | null;
}

export interface LitigationEvent {
  id: string | number;
  title: string;
  start_date: string;
  type?: string;
}

export interface LitigationStatus {
  case_id: number;
  stage: 'complaint_needed' | 'discovery' | 'motion_pending' | 'deposition' | 'trial_prep' | 'settlement';
  next_action: string;
  upcoming_events: LitigationEvent[];
}

export interface PreLitigationStatus {
  case_id: number;
  last_action: string | null;
  last_action_at: string | null;
  medical_records_status: 'up_to_date' | 'overdue' | 'unknown';
  demand_letter_status: 'not_ready' | 'ready' | 'sent';
}

export type CalendarEventType = 'deadline' | 'hearing' | 'medical' | 'deposition' | 'trial' | 'other';

export interface CalendarEventItem {
  id: string | number;
  title: string;
  date: string;
  type: CalendarEventType;
  case_id?: number | null;
  description?: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface CalendarEventsResponse {
  events: CalendarEventItem[];
  google_calendar_connected?: boolean;
  last_sync?: string | null;
}

export interface AgentAction {
  id: string;
  case_id: number;
  agent_name: string;
  action_type: string;
  status: 'completed' | 'pending_approval' | 'rejected';
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  input_data?: any;
  output_data?: any;
}

export interface DeadlineAlertItem {
  id: number;
  title: string;
  case_number: number;
  last_date_to_file_claim: string;
}

export interface DashboardStats {
  pending_approvals_count: number;
  active_cases_count: number;
  deadlines_this_week: number;
  deadline_details?: DeadlineAlertItem[];
  recent_agent_actions: AgentAction[];
  agent_status: Record<string, 'running' | 'idle' | 'error'>;
}

export interface MarketingReport {
  status: string;
  report?: string;
  marketing_data?: Record<string, unknown>;
  ran_at?: string;
}

export interface HealthResponse {
  status: string;
  mysql: string;
  postgres: string;
  dropbox: string;
  agents: Record<string, string>;
  last_cron_run?: string | null;
}

export interface SystemStats {
  total_cases: number;
  active_cases: number;
  total_agent_actions_today: number;
  pending_approvals: number;
  agents_ran_today: string[];
}

export interface AgentStatusInfo {
  status: 'running' | 'idle' | 'error';
  last_run?: string | null;
  description?: string;
}

export interface AgentStatusResponse {
  agents: Record<string, AgentStatusInfo>;
  total: number;
  active: number;
}

export interface AuditLogResponse {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  items: AgentAction[];
  data?: AgentAction[];
}
