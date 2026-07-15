'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Copy text to the clipboard and flash a "Copied" flag for ~1.8s.
export function useCopied(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback((text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable — swallow */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }, []);

  return [copied, copy];
}
