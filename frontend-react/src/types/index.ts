// ============================================
// CORE TYPES & INTERFACES
// ============================================

export enum TabType {
  DASHBOARD = 'dashboard',
  QUOTATION = 'quotation',
  CLIENT_PROFILE = 'client-profile',
  HISTORY = 'history',
  SETTINGS = 'settings',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Service {
  service_name: string;
  quantity: number;
  unit_price: number;
  price?: number; // Backward compatibility
  unit_rate?: number; // Backward compatibility
  amount: number;
  key_features?: string[]; // Auto-generated key features
}

export interface Quotation {
  services: Service[];
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  grand_total: number;
}

export interface CompanyInfo {
  company_name: string;
  tagline: string;
  website: string;
  phone_number: string;
  email: string;
  address: string;
  logo_url: string | null;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  quotation: Quotation;
  error?: string;
}

export interface QuotationResponse {
  quotation: Quotation;
}

export interface CompanyInfoResponse extends CompanyInfo {
  error?: string;
}

export interface SyncQuotationRequest {
  quotation: Quotation;
}

export interface SyncQuotationResponse {
  success: boolean;
  quotation: Quotation;
  error?: string;
}

export interface ResetQuotationResponse {
  success: boolean;
  quotation: Quotation;
}

export interface ConversationHistoryResponse {
  messages: Array<{ role: string; content: string }>;
}

export interface SyncConversationHistoryRequest {
  messages: ChatMessage[];
}

export interface SyncConversationHistoryResponse {
  success: boolean;
  messages: Array<{ role: string; content: string }>;
  error?: string;
}

// ============================================
// PDF GENERATION TYPES
// ============================================

export interface PdfOptions {
  margin: [number, number, number, number];
  filename: string;
  image: {
    type: 'jpeg' | 'png';
    quality: number;
  };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    allowTaint: boolean;
    letterRendering: boolean;
    logging: boolean;
    backgroundColor: string;
    removeContainer: boolean;
    imageTimeout: number;
    onclone?: (clonedDoc: Document) => void;
  };
  jsPDF: {
    unit: 'mm' | 'pt' | 'px' | 'in';
    format: 'a4' | 'letter' | [number, number];
    orientation: 'portrait' | 'landscape';
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export type PatternMatch = RegExpMatchArray | null;

export interface InstantUpdateResult {
  updated: boolean;
  quotation: Quotation | null;
}

export interface ServiceUpdatePattern {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, quotation: Quotation) => boolean;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface CustomerUserBreakdown {
  user_name: string;
  count: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    kpis: {
      total_quotations: number;
      total_customers: number;
      active_customers: number;
      inactive_customers: number;
      total_users: number;
    };
    monthly_sends: Array<{
      month: string;
      email: number;
      whatsapp: number;
      total: number;
    }>;
    send_breakdown: {
      email: {
        count: number;
        percentage: number;
        grand_total: number;
      };
      whatsapp: {
        count: number;
        percentage: number;
        grand_total: number;
      };
      total: number;
      total_grand_total: number;
    };
    customers: Array<{
      id: number;
      customer_name: string;
      company_name: string;
      email: string;
      phone_number: string;
      total_quotation: number;
      status: 'Active' | 'Inactive';
      user_breakdown?: CustomerUserBreakdown[];
    }>;
    year: number;
  };
}

export interface SidebarProps {
  activeTab: TabType | 'profile';
  onTabChange: (tab: TabType | 'profile') => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  allowedTabs?: TabType[];
}

export interface ChatSectionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onReset: () => Promise<void>;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export interface QuotationPreviewProps {
  quotation: Quotation | null;
  companyInfo: CompanyInfo | null;
  onDownloadPdf: () => Promise<void>;
  onQuotationUpdate?: (quotation: Quotation) => void;
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

export interface QuotationTableProps {
  quotation: Quotation;
  companyInfo: CompanyInfo | null;
  selectedClient?: Client | null;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseQuotationReturn {
  quotation: Quotation | null;
  isLoading: boolean;
  error: string | null;
  updateQuotation: (quotation: Quotation, actionName?: string) => void;
  resetQuotation: () => Promise<void>;
  syncQuotation: (quotation: Quotation) => Promise<void>;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  history: Array<{ state: Quotation | null; timestamp: number; actionName?: string }>;
  currentHistoryIndex: number;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => Promise<void>;
}

export interface UseCompanyInfoReturn {
  companyInfo: CompanyInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================
// CLIENT TYPES
// ============================================

export interface Client {
  id: number;
  customer_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientListResponse {
  clients: Client[];
  count: number;
}

export interface ClientCreateRequest {
  customer_name: string;
  company_name?: string;
  phone_number?: string;
  email: string;
  address?: string;
  is_active?: boolean;
}

export interface ClientCreateResponse {
  success: boolean;
  client: Client;
  error?: string;
}

export interface ClientUpdateRequest {
  customer_name: string;
  company_name?: string;
  phone_number?: string;
  email: string;
  address?: string;
   is_active?: boolean;
}

export interface ClientUpdateResponse {
  success: boolean;
  client: Client;
  error?: string;
}

export interface ClientDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  permissions: string[]; // Array of TabType values
  created_at?: string;
  updated_at?: string;
}

export interface UserListResponse {
  users: User[];
  count: number;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  permissions?: string[];
}

export interface UserCreateResponse {
  success: boolean;
  user: User;
  error?: string;
}

export interface UserUpdateRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  permissions?: string[];
}

export interface UserUpdateResponse {
  success: boolean;
  user: User;
  error?: string;
}

export interface UserDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface UserPasswordResetRequest {
  new_password: string;
  confirm_password: string;
}

export interface UserPasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================
// LOGIN TYPES
// ============================================

export interface CompanyLoginData {
  email: string;
  login_logo_url: string | null;
  login_image_url: string | null;
  error?: string;
}

export interface CompanyDetails {
  company_name: string;
  email: string;
  tagline: string;
  phone_number: string;
  address: string;
  sendemail: string;
  sendpassword: string;
  sendnumber: string;
  openrouter_api_key: string;
  openrouter_model: string;
  login_logo_url: string | null;
  login_image_url: string | null;
  quotation_logo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CompanyDetailsResponse {
  success: boolean;
  company?: CompanyDetails;
  message?: string;
  error?: string;
}

export interface CompanyDetailsUpdateRequest {
  company_name?: string;
  email: string;
  tagline?: string;
  phone_number?: string;
  address?: string;
  sendemail?: string;
  sendpassword?: string;
  sendnumber?: string;
  openrouter_api_key?: string;
  openrouter_model?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user_type?: 'user' | 'company';
  is_admin?: boolean;
  permissions?: string[];
  user?: {
    email: string;
    user_type: 'user' | 'company';
    is_admin: boolean;
    permissions: string[];
  };
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CheckAuthResponse {
  authenticated: boolean;
  user_email: string | null;
  is_admin?: boolean;
  permissions?: string[];
  user_name?: string | null;
  user_type?: 'user' | 'company';
  user_details?: {
    first_name?: string | null;
    last_name?: string | null;
    is_active?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    company_email?: string | null;
    send_email?: string | null;
    send_number?: string | null;
  };
}

