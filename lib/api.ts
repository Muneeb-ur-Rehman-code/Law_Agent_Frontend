import {
  AuthResponse,
  User,
  DashboardStats,
  PendingApproval,
  Case,
  SingleCaseDetail,
  AgentStatusResponse,
  AuditLogResponse,
  AgentAction,
  CalendarEventItem,
  CalendarEventsResponse,
  PreLitigationStatus,
  MedicalStatus,
  LitigationStatus,
  LemonLawStatus,
  AdminUser,
  SearchResult,
  MarketingReport,
  HealthResponse,
  SystemStats,
} from '@/types';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setCurrentUser,
  clearTokens,
} from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiration (401)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      setTokens(data.access_token, refresh);
      return true;
    }
  } catch (err) {
    console.error('Refresh token failed:', err);
  }
  return false;
}

// ---- Auth ----
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await fetchWithAuth<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.access_token, data.refresh_token);
  setCurrentUser(data.user);
  return data;
};

export const logout = async (): Promise<void> => {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      // ignore
    }
  }
  clearTokens();
};

export const getMe = async (): Promise<User> => {
  return fetchWithAuth<User>('/api/auth/me');
};

// ---- Dashboard ----
export const getDashboard = async (): Promise<DashboardStats> => {
  return fetchWithAuth<DashboardStats>('/api/dashboard');
};

// ---- Approvals ----
export const getApprovals = async (type?: string): Promise<PendingApproval[]> => {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return fetchWithAuth<PendingApproval[]>(`/api/approvals${query}`);
};

export const getDeadlineAlerts = async (): Promise<PendingApproval[]> => {
  return getApprovals('deadline');
};

// The calendar endpoint may return an array or an envelope with Google sync metadata.
export const getCalendarEvents = async (month: string): Promise<CalendarEventsResponse> => {
  const data = await fetchWithAuth<CalendarEventsResponse | CalendarEventItem[]>(
    `/api/calendar/events?month=${encodeURIComponent(month)}`
  );
  return Array.isArray(data) ? { events: data } : data;
};

export const getSchedulerStatus = async (): Promise<{
  last_run?: string | null;
  last_result?: Record<string, unknown> | null;
  last_error?: string | null;
}> => fetchWithAuth('/api/scheduler/status');

export const runMarketingAgent = async (): Promise<MarketingReport> =>
  fetchWithAuth('/api/marketing/run');
export const getHealth = async (): Promise<HealthResponse> => fetchWithAuth('/api/health');
export const getSystemStats = async (): Promise<SystemStats> => fetchWithAuth('/api/system/stats');

export const approveAction = async (id: string): Promise<void> => {
  await fetchWithAuth(`/api/approvals/${id}/approve`, { method: 'POST' });
};

export const rejectAction = async (id: string, feedback: string): Promise<void> => {
  await fetchWithAuth(`/api/approvals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
};

// ---- Cases ----
export const getCases = async (): Promise<Case[]> => {
  const res = await fetchWithAuth<{ cases: Case[]; count: number }>('/api/cases');
  return res.cases;
};

export const getCaseById = async (id: number): Promise<SingleCaseDetail> => {
  return fetchWithAuth<SingleCaseDetail>(`/api/cases/${id}`);
};

export const getPreLitigationStatus = async (caseId: number): Promise<PreLitigationStatus> => {
  return fetchWithAuth<PreLitigationStatus>(`/api/pre-litigation/status?case_id=${caseId}`);
};

export const runPreLitigationAgent = async (caseId: number): Promise<Record<string, unknown>> => {
  return fetchWithAuth<Record<string, unknown>>(`/api/pre-litigation/run?case_id=${caseId}`);
};

export const getMedicalStatus = async (caseId: number): Promise<MedicalStatus> => {
  return fetchWithAuth<MedicalStatus>(`/api/medical/status?case_id=${caseId}`);
};

export const runMedicalCheck = async (): Promise<Record<string, unknown>> => {
  return fetchWithAuth<Record<string, unknown>>('/api/medical/run');
};

export const getLitigationStatus = async (caseId: number): Promise<LitigationStatus> => {
  return fetchWithAuth<LitigationStatus>(`/api/litigation/status?case_id=${caseId}`);
};

export const runLitigationAgent = async (caseId: number): Promise<Record<string, unknown>> => {
  return fetchWithAuth<Record<string, unknown>>(`/api/litigation/run?case_id=${caseId}`);
};

export const getLemonLawStatus = async (caseId: number): Promise<LemonLawStatus> => {
  return fetchWithAuth<LemonLawStatus>(`/api/lemon-law/status?case_id=${caseId}`);
};

export const runClientComms = async (caseId: number): Promise<Record<string, unknown>> =>
  fetchWithAuth(`/api/client-comms/run?case_id=${caseId}`);

export const getAdminUsers = async (): Promise<AdminUser[]> => fetchWithAuth('/api/admin/users');
export const createAdminUser = async (payload: Record<string, unknown>): Promise<AdminUser> =>
  fetchWithAuth('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminUser = async (id: string, payload: Record<string, unknown>): Promise<AdminUser> =>
  fetchWithAuth(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const resetAdminPassword = async (id: string, newPassword: string): Promise<void> => {
  await fetchWithAuth(`/api/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ new_password: newPassword }) });
};
export const deactivateAdminUser = async (id: string): Promise<void> => {
  await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
};
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await fetchWithAuth('/api/auth/change-password', { method: 'PUT', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) });
};
export const searchWorkspace = async (query: string): Promise<SearchResult> =>
  fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}`);

export const runLemonLawAgent = async (caseId: number): Promise<Record<string, unknown>> => {
  return fetchWithAuth<Record<string, unknown>>(`/api/lemon-law/run?case_id=${caseId}`);
};

// ---- Agents ----
export const getAgentStatus = async (): Promise<AgentStatusResponse> => {
  return fetchWithAuth<AgentStatusResponse>('/api/agents/status');
};

export const triggerAgent = async (agentName: string, caseId?: number): Promise<any> => {
  return fetchWithAuth('/api/agents/trigger', {
    method: 'POST',
    body: JSON.stringify({ agent_name: agentName, case_id: caseId }),
  });
};

// ---- Audit Log ----
export const getAuditLog = async (
  page = 1,
  pageSize = 50,
  filters?: { case_id?: number; agent_name?: string; status?: string; date_from?: string; date_to?: string }
): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', pageSize.toString());
  if (filters?.case_id) params.append('case_id', filters.case_id.toString());
  if (filters?.agent_name) params.append('agent_name', filters.agent_name);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  return fetchWithAuth<AuditLogResponse>(`/api/audit-log?${params.toString()}`);
};
