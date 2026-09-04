export interface User {
  id: string;
  email: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'intake';
  first_name: string;
  last_name: string;
  practice_area: 'PI' | 'lemon_law' | 'both';
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
}
