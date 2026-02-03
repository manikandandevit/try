/**
 * useChat Hook
 * Manages chat messages and AI interactions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, MessageRole, UseChatReturn, Quotation } from '@/types';
import { MessageRole as MessageRoleEnum } from '@/types';
import { apiService } from '@/services/api';
import { tryInstantUpdate } from '@/utils/instant-update';
import { normalizeQuotation, cleanInvalidServices } from '@/utils/validation';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: MessageRoleEnum.ASSISTANT,
  content: "Hello! I'm SynQuot, your AI Quotation Assistant. I can help you create professional quotations. What service would you like to add to your quotation?",
  timestamp: new Date(),
};

// Convert backend format to frontend format
const convertBackendToFrontendMessages = (
  backendMessages: Array<{ role: string; content: string }>
): ChatMessage[] => {
  return backendMessages.map((msg, index) => ({
    id: `msg-${Date.now()}-${index}-${Math.random()}`,
    role: msg.role === 'user' ? MessageRoleEnum.USER : MessageRoleEnum.ASSISTANT,
    content: msg.content,
    timestamp: new Date(), // Backend doesn't store timestamp, use current time
  }));
};

export const useChat = (
  quotation: Quotation | null,
  updateQuotation: (quotation: Quotation) => void,
  syncQuotation: (quotation: Quotation) => Promise<void>
): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
    console.log('messages', messages);
  }, [messages, scrollToBottom]);

  // Load conversation history from backend on mount
  const loadConversationHistory = useCallback(async () => {
    try {
      const response = await apiService.getConversationHistory();
      
      if (response.messages && response.messages.length > 0) {
        // Convert backend format to frontend format
        const frontendMessages = convertBackendToFrontendMessages(response.messages);
        setMessages(frontendMessages);
      } else {
        // No history, show welcome message
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (err) {
      console.warn('Failed to load conversation history:', err);
      // On error, show welcome message
      setMessages([WELCOME_MESSAGE]);
    } finally {
      isInitialLoadRef.current = false;
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    if (isInitialLoadRef.current) {
      loadConversationHistory();
    }
  }, [loadConversationHistory]);

  // Auto-sync messages to backend with debouncing
  const autoSyncMessages = useCallback(async (messagesToSync: ChatMessage[]) => {
    // Don't sync if it's initial load or if already syncing
    if (isInitialLoadRef.current || isSyncingRef.current) {
      return;
    }

    // Clear any pending sync
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // Debounce sync by 500ms to avoid too many API calls
    syncTimerRef.current = setTimeout(async () => {
      try {
        isSyncingRef.current = true;
        await apiService.syncConversationHistory(messagesToSync);
      } catch (err) {
        // Silently fail - messages will be saved on next sync
        console.warn('Background message sync failed:', err);
      } finally {
        isSyncingRef.current = false;
      }
    }, 500);
  }, []);

  // Auto-sync whenever messages change (except during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current && messages.length > 0) {
      autoSyncMessages(messages);
    }
    // Cleanup timer on unmount
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [messages, autoSyncMessages]);

  const addMessage = useCallback((role: MessageRole, content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message
      addMessage(MessageRoleEnum.USER, message);

      // Try instant update
      const instantUpdate = tryInstantUpdate(message, quotation);

      if (instantUpdate.updated && instantUpdate.quotation) {
        updateQuotation(instantUpdate.quotation);
        syncQuotation(instantUpdate.quotation);
      }

      try {
        const response = await apiService.sendChatMessage(message);

        // Add AI response
        addMessage(MessageRoleEnum.ASSISTANT, response.response);

        // Merge server response with instant update
        if (instantUpdate.updated && instantUpdate.quotation && response.quotation) {
          const serverQuotation = normalizeQuotation(response.quotation);
          const currentQuotation = instantUpdate.quotation;

          // Clean invalid services
          currentQuotation.services = cleanInvalidServices(currentQuotation.services);
          serverQuotation.services = cleanInvalidServices(serverQuotation.services);

          // Merge services: avoid duplicates by name
          const existingServiceNames = new Set(
            currentQuotation.services.map((s) => s.service_name.toLowerCase())
          );

          for (const serverService of serverQuotation.services) {
            const serverServiceName = serverService.service_name.toLowerCase();

            if (!existingServiceNames.has(serverServiceName)) {
              currentQuotation.services.push(serverService);
              existingServiceNames.add(serverServiceName);
            } else {
              // Update existing service with server's data if it has valid values
              const existingIndex = currentQuotation.services.findIndex(
                (s) => s.service_name.toLowerCase() === serverServiceName
              );

              if (existingIndex !== -1) {
                const existingService = currentQuotation.services[existingIndex];
                if (!existingService) continue;
                const serverPrice = serverService.unit_price || serverService.price || serverService.unit_rate || 0;
                const existingPrice = existingService.unit_price || existingService.price || existingService.unit_rate || 0;

                if (serverService.quantity > 0 && serverPrice > 0) {
                  currentQuotation.services[existingIndex] = serverService;
                } else if (existingPrice > 0 && serverPrice === 0) {
                  // Keep existing
                }
              }
            }
          }

          // Use server's calculated totals
          currentQuotation.subtotal = serverQuotation.subtotal || currentQuotation.subtotal;
          currentQuotation.gst_percentage = serverQuotation.gst_percentage || currentQuotation.gst_percentage;
          currentQuotation.gst_amount = serverQuotation.gst_amount || currentQuotation.gst_amount;
          currentQuotation.grand_total = serverQuotation.grand_total || currentQuotation.grand_total;

          updateQuotation(currentQuotation);
        } else {
          // No instant update, use server response
          const normalized = normalizeQuotation(response.quotation);
          updateQuotation(normalized);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        addMessage(MessageRoleEnum.ASSISTANT, `Error: ${errorMessage}`);

        // Revert instant update on error
        if (instantUpdate.updated && quotation) {
          updateQuotation(quotation);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, quotation, updateQuotation, syncQuotation, addMessage]
  );

  const resetChat = useCallback(async () => {
    if (!window.confirm('Are you sure you want to reset the quotation? This will clear all data.')) {
      return;
    }

    setMessages([WELCOME_MESSAGE]);
    setError(null);
    
    // Sync empty conversation (only welcome message) to backend
    try {
      await apiService.syncConversationHistory([WELCOME_MESSAGE]);
    } catch (err) {
      console.warn('Failed to sync reset conversation:', err);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
  };
};

