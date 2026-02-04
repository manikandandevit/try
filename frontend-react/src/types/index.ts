// ============================================
// CORE TYPES & INTERFACES
// ============================================

export enum TabType {
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

export interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
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
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ClientListResponse {
  clients: Client[];
  count: number;
}

export interface ClientCreateRequest {
  name: string;
  email: string;
}

export interface ClientCreateResponse {
  success: boolean;
  client: Client;
  error?: string;
}

export interface ClientUpdateRequest {
  name: string;
  email: string;
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
// LOGIN TYPES
// ============================================

export interface CompanyLoginData {
  email: string;
  login_logo_url: string | null;
  login_image_url: string | null;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
}

