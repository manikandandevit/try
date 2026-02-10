/**
 * Message Bubble Component
 */

import React from 'react';
import type { MessageBubbleProps } from '@/types';
import { MessageRole } from '@/types';
import styles from './MessageBubble.module.css';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const timeString = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.messageContent}>
        {!isUser && <strong>SynQuot:</strong>} {message.content}
      </div>
      <div className={styles.messageTime}>{timeString}</div>
    </div>
  );
};

