'use client';

import type { MouseEvent } from 'react';
import { asset, BASE_PATH } from '@/lib/config';
import { useFlow } from '@/state/FlowContext';
import styles from './AppHeader.module.scss';

export function AppHeader() {
  const { restart } = useFlow();

  // Home = the app's landing screen. Intercept a plain left-click for an instant
  // client-side reset; let modifier/middle clicks fall through so the real href
  // (open-in-new-tab, etc.) still works and it stays a genuine, accessible link.
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    restart();
  };

  return (
    <header className={styles.header}>
      <a
        className={styles.inner}
        href={`${BASE_PATH}/`}
        onClick={goHome}
        aria-label="Rain Garden Advisor home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logo}
          src={asset('/rga_logo.svg')}
          alt="Rain Garden Advisor logo"
        />
        <h1 className={styles.title}>Rain Garden Advisor</h1>
      </a>
    </header>
  );
}
