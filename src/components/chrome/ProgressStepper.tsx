import type { CSSProperties } from 'react';
import type { Stage } from '@/lib/types';
import { CheckIcon } from '../primitives/Icons';
import styles from './ProgressStepper.module.scss';

// band-full treatment: idle circles sit on the pale-blue band, so the same-tone
// --color-secondary-light stroke would vanish — swap to higher-contrast slate.
const IDLE_STROKE = 'var(--color-primary)';
const IDLE_TRACK = 'var(--surface-app)';
const IDLE_CONN = 'var(--color-primary)';

type Props = {
  stages: Stage[];
  // Frontend-only treatment: when the conversation was declined, the current
  // in_progress circle gets a dashed "halt" look. Not a Stage value.
  declined?: boolean;
};

export function ProgressStepper({ stages, declined = false }: Props) {
  return (
    <div className={styles.band}>
      <div className={styles.row}>
        {stages.map((st, i) => {
          const isFrozen = declined && st.state === 'in_progress';
          const isComplete = st.state === 'complete';
          const isInProgress = st.state === 'in_progress' && !isFrozen;
          const isNotStarted = st.state === 'not_started';

          const labelColor = isComplete
            ? 'var(--color-accent-deep)'
            : isInProgress
              ? 'var(--color-primary-dark)'
              : 'var(--text-muted)';

          const connColor = isComplete ? 'var(--color-accent-deep)' : IDLE_CONN;

          const inProgStyle: CSSProperties = {
            background: `conic-gradient(var(--color-secondary) 0deg, var(--color-primary) 216deg, ${IDLE_TRACK} 216deg 360deg)`,
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
          };

          return (
            <div key={st.id} className={styles.stageWrap}>
              <div className={styles.stage}>
                {isComplete && (
                  <span className={`${styles.circle} ${styles.complete}`}>
                    <CheckIcon size={12} style={{ stroke: 'var(--color-white)' }} />
                  </span>
                )}
                {isInProgress && <span className={styles.circle} style={inProgStyle} />}
                {isFrozen && (
                  <span
                    className={styles.circle}
                    style={{ border: `2.5px dashed ${IDLE_STROKE}` }}
                  />
                )}
                {isNotStarted && (
                  <span
                    className={styles.circle}
                    style={{ border: `2px solid ${IDLE_STROKE}` }}
                  />
                )}
                <span className={styles.label} style={{ color: labelColor }}>
                  {st.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <span className={styles.connector} style={{ background: connColor }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
