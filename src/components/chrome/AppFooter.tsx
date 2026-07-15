import { GitHubIcon, InstagramIcon, LinkedInIcon } from '../primitives/Icons';
import styles from './AppFooter.module.scss';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <a href="#" aria-label="GitHub" className={styles.iconLink}>
          <GitHubIcon />
        </a>
        <a href="#" aria-label="LinkedIn" className={styles.iconLink}>
          <LinkedInIcon />
        </a>
        <a href="#" aria-label="Instagram" className={styles.iconLink}>
          <InstagramIcon />
        </a>
      </div>
      <span className={styles.copyright}>
        © 2026{' '}
        <a href="#" className={styles.authorLink}>
          Jess Bodie Richards
        </a>
        . All rights reserved.
      </span>
    </footer>
  );
}
