'use client';

import { useState } from 'react';
import { asset } from '@/lib/config';
import styles from './SeasonalCarousel.module.scss';

const GALLERY = [
  { src: '/rg_back_wet_july_crop.jpg', month: 'Another rain storm (July)' },
  { src: '/rg_back_wet_april_crop.jpg', month: 'First spring-time storm (April)' },
  { src: '/rg_back_dry_sep_crop.jpg', month: 'Newly planted (September)' },
];

export function SeasonalCarousel() {
  const [idx, setIdx] = useState(0);
  const gi = ((idx % GALLERY.length) + GALLERY.length) % GALLERY.length;
  const current = GALLERY[gi];

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => i - 1);
  };
  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdx((i) => i + 1);
  };

  return (
    <figure className={styles.figure}>
      <div
        className={styles.frame}
        style={{ backgroundImage: `url('${asset(current.src)}')` }}
        onClick={() => next()}
      >
        <span className={styles.month}>{current.month}</span>
        <button aria-label="Previous photo" className={`${styles.nav} ${styles.prev}`} onClick={prev}>
          &#8249;
        </button>
        <button aria-label="Next photo" className={`${styles.nav} ${styles.next}`} onClick={next}>
          &#8250;
        </button>
        <div className={styles.dots}>
          {GALLERY.map((g, i) => (
            <button
              key={g.month}
              aria-label={`Show ${g.month} photo`}
              className={styles.dot}
              style={{ background: i === gi ? 'var(--color-white)' : 'rgba(255,255,255,.45)' }}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
            />
          ))}
        </div>
      </div>
      <figcaption className={styles.caption}>
        Backyard rain garden 
      </figcaption>
    </figure>
  );
}
