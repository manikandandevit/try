/**
 * useQuotation Hook
 * Manages quotation state and operations with undo/redo functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quotation, UseQuotationReturn } from '@/types';
import { apiService } from '@/services/api';
import { normalizeQuotation, validateQuotation } from '@/utils/validation';
import { useUndoRedo } from './useUndoRedo';

const initialQuotation: Quotation = {
  services: [],
  subtotal: 0,
  gst_percentage: 0,
  gst_amount: 0,
  grand_total: 0,
};

export const useQuotation = (): UseQuotationReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  // Use undo/redo hook for quotation state management
  const {
    state: quotation,
    setState: setQuotationState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentHistoryIndex,
    clearHistory,
  } = useUndoRedo<Quotation | null>(null, {
    maxHistorySize: 50,
    debounceMs: 0, // No debounce for quotation updates
  });

  // Auto-sync quotation to backend with debouncing
  const autoSyncQuotation = useCallback(async (quotationToSync: Quotation | null) => {
    // Don't sync if it's initial load or if already syncing
    if (isInitialLoadRef.current || !quotationToSync || isSyncingRef.current) {
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
        const normalized = normalizeQuotation(quotationToSync);
        if (validateQuotation(normalized)) {
          await apiService.syncQuotation(normalized);
        }
      } catch (err) {
        // Silently fail - server will update when AI responds or on next sync
        console.warn('Background sync failed:', err);
      } finally {
        isSyncingRef.current = false;
      }
    }, 500);
  }, []);

  // Auto-sync whenever quotation changes (except during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current && quotation) {
      autoSyncQuotation(quotation);
    }
    // Cleanup timer on unmount
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [quotation, autoSyncQuotation]);

  const loadQuotation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getQuotation();
      const normalized = normalizeQuotation(response.quotation);
      if (validateQuotation(normalized)) {
        setQuotationState(normalized, 'Load Quotation');
      } else {
        setQuotationState(initialQuotation, 'Load Quotation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotation');
      setQuotationState(initialQuotation, 'Load Quotation');
    } finally {
      setIsLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [setQuotationState]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      loadQuotation();
    }
  }, [loadQuotation]);

  const updateQuotation = useCallback(
    (newQuotation: Quotation, actionName?: string) => {
      const normalized = normalizeQuotation(newQuotation);
      if (validateQuotation(normalized)) {
        setQuotationState(normalized, actionName || 'Update Quotation');
        // Auto-sync will be triggered by the useEffect above
      }
    },
    [setQuotationState]
  );

  const resetQuotation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prevent auto-sync during reset
      isSyncingRef.current = true;
      
      // Clear any pending auto-sync
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      
      // Immediately set quotation to empty state for instant UI update
      setQuotationState(initialQuotation, 'Reset Quotation');
      clearHistory();
      
      // Sync empty state to backend
      try {
        await apiService.resetQuotation();
      } catch (apiErr) {
        console.warn('Failed to sync reset to backend:', apiErr);
        // Don't throw - UI is already updated
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset quotation');
      // Even on error, ensure quotation is reset
      setQuotationState(initialQuotation, 'Reset Quotation');
      clearHistory();
    } finally {
      isSyncingRef.current = false;
      setIsLoading(false);
    }
  }, [setQuotationState, clearHistory]);

  const syncQuotation = useCallback(
    async (quotationToSync: Quotation) => {
      try {
        const normalized = normalizeQuotation(quotationToSync);
        if (validateQuotation(normalized)) {
          isSyncingRef.current = true;
          // Clear any pending auto-sync to avoid duplicate calls
          if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
          }
          await apiService.syncQuotation(normalized);
          // Sync operations update state but don't need explicit history tracking
          // as they're usually followed by user actions
          setQuotationState(normalized, 'Sync Quotation');
        }
      } catch (err) {
        // Silently fail - server will update when AI responds
        console.warn('Background sync failed:', err);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [setQuotationState]
  );

  return {
    quotation,
    isLoading,
    error,
    updateQuotation,
    resetQuotation,
    syncQuotation,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentHistoryIndex,
  };
};

