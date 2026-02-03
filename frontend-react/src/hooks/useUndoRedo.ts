/**
 * useUndoRedo Hook
 * Generic hook for undo/redo functionality with action history
 */

import { useState, useCallback, useRef } from 'react';

export interface ActionHistory<T> {
  state: T;
  timestamp: number;
  actionName?: string;
}

export interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T, actionName?: string) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  history: ActionHistory<T>[];
  currentHistoryIndex: number;
  clearHistory: () => void;
}

export interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

/**
 * Generic undo/redo hook with action history tracking
 * @param initialState - Initial state value
 * @param options - Configuration options
 * @returns Undo/redo functionality and state management
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const { maxHistorySize = 50, debounceMs = 0 } = options;

  // History stack: [past states..., current state, future states...]
  const [history, setHistory] = useState<ActionHistory<T>[]>([
    { state: initialState, timestamp: Date.now() },
  ]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  // Keep ref in sync with state
  indexRef.current = currentHistoryIndex;

  const currentState = history[currentHistoryIndex]?.state ?? initialState;
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const setState = useCallback(
    (newState: T, actionName?: string) => {
      // Clear any pending debounced state updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const updateHistory = () => {
        setHistory((prevHistory) => {
          const currentIndex = indexRef.current;
          
          // If we're not at the end, remove future states (branching)
          const newHistory = prevHistory.slice(0, currentIndex + 1);
          
          // Add new state
          newHistory.push({
            state: newState,
            timestamp: Date.now(),
            actionName,
          });

          // Limit history size
          if (newHistory.length > maxHistorySize) {
            // Remove oldest entries, keep at least current state
            const removeCount = newHistory.length - maxHistorySize;
            newHistory.splice(0, removeCount);
          }

          // Update index to point to the new state
          const finalIndex = newHistory.length - 1;
          setCurrentHistoryIndex(finalIndex);
          indexRef.current = finalIndex;
          
          return newHistory;
        });
      };

      if (debounceMs > 0) {
        // Debounce rapid state changes
        debounceTimerRef.current = setTimeout(updateHistory, debounceMs);
      } else {
        updateHistory();
      }
    },
    [maxHistorySize, debounceMs]
  );

  const undo = useCallback(() => {
    if (!canUndo) return false;

    setCurrentHistoryIndex((prevIndex) => {
      const newIndex = Math.max(0, prevIndex - 1);
      indexRef.current = newIndex;
      return newIndex;
    });

    return true;
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return false;

    setCurrentHistoryIndex((prevIndex) => {
      const newIndex = Math.min(history.length - 1, prevIndex + 1);
      indexRef.current = newIndex;
      return newIndex;
    });

    return true;
  }, [canRedo, history.length]);

  const clearHistory = useCallback(() => {
    const currentState = history[currentHistoryIndex]?.state ?? initialState;
    setHistory([{ state: currentState, timestamp: Date.now() }]);
    setCurrentHistoryIndex(0);
    indexRef.current = 0;
  }, [history, currentHistoryIndex, initialState]);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentHistoryIndex,
    clearHistory,
  };
}
