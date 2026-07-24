'use client';

import type { ReactNode } from 'react';
import { useFlow } from '@/state/FlowContext';
import type { Stage } from '@/lib/types';
import { AppHeader } from './chrome/AppHeader';
import { AppFooter } from './chrome/AppFooter';
import { ProgressStepper } from './chrome/ProgressStepper';
import { AddressScreen } from './address/AddressScreen';
import { ChatScreen } from './chat/ChatScreen';
import { ResultsScreen } from './results/ResultsScreen';
import styles from './AppShell.module.scss';

// Pre-response fallback so the Address screen shows the stepper before the
// first API turn returns real `stages`.
const ADDRESS_FALLBACK: Stage[] = [
  { id: 'address', label: 'Address', state: 'in_progress' },
  { id: 'localized_data', label: 'Localized Data', state: 'not_started' },
  { id: 'site_conditions', label: 'Site Conditions', state: 'not_started' },
  { id: 'growing_conditions', label: 'Growing Conditions', state: 'not_started' },
  { id: 'plan', label: 'Rain Garden Plan', state: 'not_started' },
];

export function AppShell({ landing }: { landing: ReactNode }) {
  const flow = useFlow();
  const showStepper = flow.phase !== 'landing';
  const stages = flow.stages ?? (flow.phase === 'address' ? ADDRESS_FALLBACK : null);
  // Chat is the only phase that locks to the viewport with an inner scroll
  // region (Claude-style); landing/address/results keep natural page scroll.
  const locked = flow.phase === 'chat';

  return (
    <div className={`${styles.frame} ${locked ? styles.frameLocked : ''}`}>
      <AppHeader />
      {showStepper && stages && <ProgressStepper stages={stages} declined={flow.declined} />}
      <main className={`${styles.main} ${locked ? styles.mainLocked : ''}`}>
        {flow.phase === 'landing' && landing}
        {flow.phase === 'address' && <AddressScreen />}
        {flow.phase === 'chat' && <ChatScreen />}
        {flow.phase === 'results' && <ResultsScreen />}
      </main>
      <AppFooter />
    </div>
  );
}
