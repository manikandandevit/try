/**
 * API Service Layer
 * Handles all HTTP requests to Django backend
 */

import type {
  ChatRequest,
  ChatResponse,
  QuotationResponse,
  CompanyInfoResponse,
  SyncQuotationRequest,
  SyncQuotationResponse,
  ResetQuotationResponse,
  ConversationHistoryResponse,
  SyncConversationHistoryRequest,
  SyncConversationHistoryResponse,
  ClientListResponse,
  ClientCreateRequest,
  ClientCreateResponse,
  ClientUpdateRequest,
  ClientUpdateResponse,
  ClientDeleteResponse,
  User,
  UserListResponse,
  UserCreateRequest,
  UserCreateResponse,
  UserUpdateRequest,
  UserUpdateResponse,
  UserDeleteResponse,
  UserPasswordResetRequest,
  UserPasswordResetResponse,
  CompanyLoginData,
  CompanyDetailsResponse,
  CompanyDetailsUpdateRequest,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  CheckAuthResponse,
  DashboardStatsResponse,
} from '@/types';
import { getCsrfToken } from '@/utils/csrf';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const fetchWithCsrf = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const csrfToken = getCsrfToken();
  
  // Get access token from localStorage
  const accessToken = localStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
    ...options.headers,
  };

  // Add Authorization header if access token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  /**
   * Send chat message to AI
   */
  sendChatMessage: async (message: string): Promise<ChatResponse> => {
    const request: ChatRequest = { message };
    return fetchWithCsrf<ChatResponse>(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get current quotation from session
   */
  getQuotation: async (): Promise<QuotationResponse> => {
    return fetchWithCsrf<QuotationResponse>(`${API_BASE_URL}/quotation/`, {
      method: 'GET',
    });
  },

  /**
   * Sync quotation state to server
   */
  syncQuotation: async (
    quotation: SyncQuotationRequest['quotation']
  ): Promise<SyncQuotationResponse> => {
    const request: SyncQuotationRequest = { quotation };
    return fetchWithCsrf<SyncQuotationResponse>(`${API_BASE_URL}/sync-quotation/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Reset quotation to empty state
   */
  resetQuotation: async (): Promise<ResetQuotationResponse> => {
    return fetchWithCsrf<ResetQuotationResponse>(`${API_BASE_URL}/reset/`, {
      method: 'POST',
    });
  },

  /**
   * Get company information
   */
  getCompanyInfo: async (): Promise<CompanyInfoResponse> => {
    return fetchWithCsrf<CompanyInfoResponse>(`${API_BASE_URL}/company-info/`, {
      method: 'GET',
    });
  },

  /**
   * Get conversation history from session
   */
  getConversationHistory: async (): Promise<ConversationHistoryResponse> => {
    return fetchWithCsrf<ConversationHistoryResponse>(`${API_BASE_URL}/conversation-history/`, {
      method: 'GET',
    });
  },

  /**
   * Sync conversation history to server
   */
  syncConversationHistory: async (
    messages: SyncConversationHistoryRequest['messages']
  ): Promise<SyncConversationHistoryResponse> => {
    const request: SyncConversationHistoryRequest = { messages };
    return fetchWithCsrf<SyncConversationHistoryResponse>(`${API_BASE_URL}/sync-conversation-history/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * List all clients with optional search
   */
  listClients: async (search?: string): Promise<ClientListResponse> => {
    const url = search
      ? `${API_BASE_URL}/clients/?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/clients/`;
    return fetchWithCsrf<ClientListResponse>(url, {
      method: 'GET',
    });
  },

  /**
   * Create a new client
   */
  createClient: async (data: ClientCreateRequest): Promise<ClientCreateResponse> => {
    return fetchWithCsrf<ClientCreateResponse>(`${API_BASE_URL}/clients/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing client
   */
  updateClient: async (
    clientId: number,
    data: ClientUpdateRequest
  ): Promise<ClientUpdateResponse> => {
    return fetchWithCsrf<ClientUpdateResponse>(`${API_BASE_URL}/clients/${clientId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a client
   */
  deleteClient: async (clientId: number): Promise<ClientDeleteResponse> => {
    return fetchWithCsrf<ClientDeleteResponse>(`${API_BASE_URL}/clients/${clientId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get company login data (logo, image, email)
   */
  getCompanyLogin: async (): Promise<CompanyLoginData> => {
    return fetchWithCsrf<CompanyLoginData>(`${API_BASE_URL}/company-login/`, {
      method: 'GET',
    });
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const request: LoginRequest = { email, password };
    return fetchWithCsrf<LoginResponse>(`${API_BASE_URL}/login/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Logout - clears session for security
   */
  logout: async (): Promise<LogoutResponse> => {
    return fetchWithCsrf<LogoutResponse>(`${API_BASE_URL}/logout/`, {
      method: 'POST',
    });
  },

  /**
   * Check if user is authenticated
   */
  checkAuth: async (): Promise<CheckAuthResponse> => {
    return fetchWithCsrf<CheckAuthResponse>(`${API_BASE_URL}/check-auth/`, {
      method: 'GET',
    });
  },

  /**
   * List all users with optional search
   */
  listUsers: async (search?: string): Promise<UserListResponse> => {
    const url = search
      ? `${API_BASE_URL}/users/?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/users/`;
    return fetchWithCsrf<UserListResponse>(url, {
      method: 'GET',
    });
  },

  /**
   * Create a new user
   */
  createUser: async (data: UserCreateRequest): Promise<UserCreateResponse> => {
    return fetchWithCsrf<UserCreateResponse>(`${API_BASE_URL}/users/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing user
   */
  updateUser: async (
    userId: number,
    data: UserUpdateRequest
  ): Promise<UserUpdateResponse> => {
    return fetchWithCsrf<UserUpdateResponse>(`${API_BASE_URL}/users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: number): Promise<UserDeleteResponse> => {
    return fetchWithCsrf<UserDeleteResponse>(`${API_BASE_URL}/users/${userId}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (
    userId: number,
    data: UserPasswordResetRequest
  ): Promise<UserPasswordResetResponse> => {
    return fetchWithCsrf<UserPasswordResetResponse>(`${API_BASE_URL}/users/${userId}/reset-password/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Send quotation PDF via email using SMTP
   */
  sendQuotationEmail: async (
    recipientEmail: string,
    customerName: string,
    pdfBlob: Blob,
    pdfFilename: string
  ): Promise<{ success: boolean; message: string }> => {
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });

    const pdfBase64 = await base64Promise;

    return fetchWithCsrf<{ success: boolean; message: string }>(`${API_BASE_URL}/send-quotation-email/`, {
      method: 'POST',
      body: JSON.stringify({
        recipient_email: recipientEmail,
        customer_name: customerName,
        pdf_base64: pdfBase64,
        pdf_filename: pdfFilename,
      }),
    });
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (year?: number): Promise<DashboardStatsResponse> => {
    const url = year
      ? `${API_BASE_URL}/dashboard-stats/?year=${year}`
      : `${API_BASE_URL}/dashboard-stats/`;
    return fetchWithCsrf<DashboardStatsResponse>(url, {
      method: 'GET',
    });
  },

  /**
   * Get company details for settings
   */
  getCompanyDetails: async (): Promise<CompanyDetailsResponse> => {
    return fetchWithCsrf<CompanyDetailsResponse>(`${API_BASE_URL}/company-details/`, {
      method: 'GET',
    });
  },

  /**
   * Update company details
   */
  updateCompanyDetails: async (data: CompanyDetailsUpdateRequest): Promise<CompanyDetailsResponse> => {
    return fetchWithCsrf<CompanyDetailsResponse>(`${API_BASE_URL}/company-details/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export { ApiError };

