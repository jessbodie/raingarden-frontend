'use client';

import { useCopied } from '@/state/useCopied';
import { CopyIcon, EditIcon } from '../primitives/Icons';
import styles from './PlanCard.module.scss';

export type PlanAdvisory = { message: string; color: string };

export function PlanCard({
  advisories,
  summary,
  notRecommended,
  onEdit,
}: {
  advisories: PlanAdvisory[];
  summary: string;
  notRecommended: boolean;
  onEdit: () => void;
}) {
  const [copied, copy] = useCopied();

  const handleCopy = () => {
    const lines = ['Your Rain Garden Plan', '', 'First things first:'];
    advisories.forEach((a) => lines.push('- ' + a.message));
    lines.push('', summary);
    copy(lines.join('\n'));
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={`${styles.title} ${notRecommended ? styles.titleMuted : ''}`}>
          Your Rain Garden Plan
        </h2>
        <div className={styles.actions}>
          {copied && <span className={styles.copied}>Copied</span>}
          <button className={styles.iconBtn} onClick={onEdit} title="Edit plan" aria-label="Edit plan">
            <EditIcon size={18} />
          </button>
          <button className={styles.iconBtn} onClick={handleCopy} title="Copy plan" aria-label="Copy plan">
            <CopyIcon size={18} />
          </button>
        </div>
      </div>

      {notRecommended && (
        <div className={styles.notRecCallout}>
          <span className={styles.notRecLabel}>Not recommended</span>
        </div>
      )}

      <p className={styles.lead}>First things first:</p>
      <ul className={styles.advisories}>
        {advisories.map((a, i) => (
          <li key={i} className={styles.advisory} style={{ color: a.color }}>
            <span className={styles.bullet} style={{ color: a.color }}>
              ■
            </span>
            <span>{a.message}</span>
          </li>
        ))}
      </ul>
      <p className={styles.summary}>{summary}</p>
    </div>
  );
}
