import { asset } from '@/lib/config';
import styles from './AppHeader.module.scss';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logo}
          src={asset('/rga_logo.svg')}
          alt="Rain Garden Advisor logo"
        />
        <h1 className={styles.title}>Rain Garden Advisor</h1>
      </div>
    </header>
  );
}
