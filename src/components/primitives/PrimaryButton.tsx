'use client';

import type { ButtonHTMLAttributes } from 'react';
import styles from './PrimaryButton.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'sm';
};

// Accent-filled, sharp-cornered CTA with hover-lift (the shared button convention).
export function PrimaryButton({ size = 'md', className, children, ...rest }: Props) {
  const cls = [styles.btn, size === 'sm' ? styles.sm : styles.md, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
