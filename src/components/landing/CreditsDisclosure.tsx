'use client';

import { useState } from 'react';
import styles from './CreditsDisclosure.module.scss';

// NOTE: PLACEHOLDER content — final Credits & Sources copy (incl. the RAG
// guidance citations) is supplied by Jess after the UI is built.
export function CreditsDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.chevron} style={{ transform: `rotate(${open ? 90 : 0}deg)` }}>
          ›
        </span>
        <span className={styles.title}>Credits &amp; Sources</span>
      </button>
      {open && (
        <div className={styles.body}>
          <p className={styles.placeholder}>
            [ PLACEHOLDER — populated from server-retained RAG guidance citations + data-source
            attributions ]
          </p>
          <ul className={styles.list}>
            <li className={styles.item}>
              <span className={styles.bullet}>■</span>USDA Plant Hardiness Zone data
            </li>
            <li className={styles.item}>
              <span className={styles.bullet}>■</span>NOAA precipitation normals
            </li>
            <li className={styles.item}>
              <span className={styles.bullet}>■</span>EPA &amp; regional stormwater rain-garden guidance
            </li>
            <li className={styles.item}>
              <span className={styles.bullet}>■</span>Native plant database &amp; moisture-tolerance references
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
