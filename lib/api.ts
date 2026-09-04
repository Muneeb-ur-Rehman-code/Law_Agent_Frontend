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
export const getApprovals = async (): Promise<PendingApproval[]> => {
  return fetchWithAuth<PendingApproval[]>('/api/approvals');
};

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
  filters?: { case_id?: number; agent_name?: string; status?: string }
): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  if (filters?.case_id) params.append('case_id', filters.case_id.toString());
  if (filters?.agent_name) params.append('agent_name', filters.agent_name);
  if (filters?.status) params.append('status', filters.status);

  return fetchWithAuth<AuditLogResponse>(`/api/audit-log?${params.toString()}`);
};
