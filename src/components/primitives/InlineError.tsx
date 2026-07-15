import { ErrorCircleIcon } from './Icons';
import styles from './InlineError.module.scss';

// Filled error-circle + error-tone message. Used on Address and Chat screens.
export function InlineError({ message }: { message: string }) {
  return (
    <div className={styles.row}>
      <ErrorCircleIcon size={18} style={{ fill: 'var(--color-error)', flex: '0 0 auto' }} />
      <span className={styles.msg}>{message}</span>
    </div>
  );
}
