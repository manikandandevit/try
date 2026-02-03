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

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      ...options.headers,
    },
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
};

export { ApiError };

