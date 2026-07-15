'use client';

import { useState } from 'react';
import { SendArrowIcon } from '../primitives/Icons';
import styles from './ChatInput.module.scss';

export function ChatInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState('');

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className={styles.wrap} style={{ opacity: disabled ? 0.55 : 1 }}>
      <textarea
        className={styles.input}
        placeholder="Write your response"
        value={value}
        disabled={disabled}
        rows={2}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
      />
      <button
        className={styles.send}
        onClick={send}
        disabled={disabled}
        aria-label="Send response"
      >
        <SendArrowIcon size={18} />
      </button>
    </div>
  );
}
