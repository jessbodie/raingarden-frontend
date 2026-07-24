'use client';

import { useEffect, useRef } from 'react';
import { useFlow } from '@/state/FlowContext';
import { renderInlineMarkdown } from '@/lib/inlineMarkdown';
import { ErrorCircleIcon, RefreshIcon } from '../primitives/Icons';
import { ChatInput } from './ChatInput';
import styles from './ChatScreen.module.scss';

export function ChatScreen() {
  const flow = useFlow();
  const showInput = !flow.declined;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view (Claude-style): pin the transcript scroll
  // region to the bottom whenever the log grows or a pending/error/decline row
  // appears.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [flow.chatLog, flow.pending, flow.chatError, flow.declined]);

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.transcript}>
        {flow.chatLog.map((m, i) =>
          m.role === 'advisor' ? (
            <div key={i} className={`${styles.advisor} rga-fu`}>
              <span className={styles.avatar}>RG</span>
              <div className={styles.advisorText}>{renderInlineMarkdown(m.text)}</div>
            </div>
          ) : (
            <div key={i} className={`${styles.userRow} rga-fu`}>
              <div className={styles.userBubble}>{m.text}</div>
            </div>
          ),
        )}

        {flow.pending && (
          <div className={styles.pending}>
            <span className={styles.spinner} />
            <span className={styles.pendingText}>{flow.pendingText}</span>
          </div>
        )}

        {flow.chatError && (
          <>
            <div className={styles.retryRow}>
              <button
                className={styles.retryBtn}
                onClick={flow.retry}
                title="Retry"
                aria-label="Retry"
              >
                <RefreshIcon size={18} />
              </button>
            </div>
            <div className={styles.errorRow}>
              <ErrorCircleIcon size={18} style={{ fill: 'var(--color-error)', flex: '0 0 auto' }} />
              <span className={styles.errorText}>
                Something went wrong.... please retry in a moment.
              </span>
            </div>
          </>
        )}

        {flow.declined && (
          <div className={styles.restartRow}>
            We hope you consider{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                flow.restart();
              }}
            >
              restarting your rain garden design
            </a>
            . Good luck with your future gardening adventures!
          </div>
        )}
        </div>
      </div>

      {showInput && (
        <div className={styles.inputDock}>
          <div className={styles.inputInner}>
            <ChatInput disabled={flow.pending} onSend={flow.sendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
