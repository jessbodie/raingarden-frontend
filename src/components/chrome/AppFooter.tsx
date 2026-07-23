import { GitHubIcon, InstagramIcon, LinkedInIcon } from '../primitives/Icons';
import styles from './AppFooter.module.scss';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <a
          href="https://github.com/jessbodie"
          aria-label="GitHub"
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </a>
        <a
          href="https://www.linkedin.com/in/jessbodie/"
          aria-label="LinkedIn"
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://www.instagram.com/sustainable.urban.gardening/"
          aria-label="Instagram"
          className={styles.iconLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon />
        </a>
      </div>
      <span className={styles.copyright}>
        © 2026{' '}
        <a href="https://www.jessbodie.com" className={styles.authorLink}>
          Jess Bodie Richards
        </a>
        . All rights reserved.
      </span>
    </footer>
  );
}
