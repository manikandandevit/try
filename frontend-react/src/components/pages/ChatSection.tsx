/**
 * Chat Section Component
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ChatSectionProps } from '@/types';
import { MessageBubble } from '@/components/common/MessageBubble';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import styles from './ChatSection.module.css';

export const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.chatSection}>
      <div className={styles.chatHeader}>
        <h2 className={styles.headerTitle}>Conversation</h2>
      </div>

      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.chatInputContainer} onSubmit={handleSubmit}>
        <div className={styles.chatInputWrapper}>
          <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
          className={styles.chatInput}
        />
          <button
          type="submit"
            className={styles.sendButton}
          disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
        >
            <span className="material-icons">send</span>
          </button>
        </div>
      </form>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner size="medium" message="SynQuot is thinking..." />
        </div>
      )}
    </div>
  );
};

