'use client';

import type { ReactNode } from 'react';
import { useFlow } from '@/state/FlowContext';
import { SUBMIT_LOCALIZED_PHASE } from '@/state/useRainGardenFlow';
import type { Stage } from '@/lib/types';
import { AppHeader } from './chrome/AppHeader';
import { AppFooter } from './chrome/AppFooter';
import { ProgressStepper } from './chrome/ProgressStepper';
import { AddressScreen } from './address/AddressScreen';
import { ChatScreen } from './chat/ChatScreen';
import { ResultsScreen } from './results/ResultsScreen';
import styles from './AppShell.module.scss';

// Pre-response stepper for the Address screen, shown before the first API turn
// returns real `stages`. While the seed request is in flight it advances with the
// simulated submit phase: past SUBMIT_LOCALIZED_PHASE the address work is (notionally)
// done, so Address flips to complete and Localized Data becomes the in-progress cursor.
function addressStages(submitting: boolean, phase: number): Stage[] {
  const localized = submitting && phase >= SUBMIT_LOCALIZED_PHASE;
  return [
    { id: 'address', label: 'Address', state: localized ? 'complete' : 'in_progress' },
    {
      id: 'localized_data',
      label: 'Localized Data',
      state: localized ? 'in_progress' : 'not_started',
    },
    { id: 'site_conditions', label: 'Site Conditions', state: 'not_started' },
    { id: 'growing_conditions', label: 'Growing Conditions', state: 'not_started' },
    { id: 'plan', label: 'Rain Garden Plan', state: 'not_started' },
  ];
}

export function AppShell({ landing }: { landing: ReactNode }) {
  const flow = useFlow();
  const showStepper = flow.phase !== 'landing';
  // On the address phase the simulated stepper always wins (so a retry still
  // animates); when not submitting it matches the backend's minimal address
  // stepper anyway. Other phases render the real `stages` from the API.
  const stages =
    flow.phase === 'address'
      ? addressStages(flow.addressSubmitting, flow.addressPhase)
      : flow.stages;
  // Chat is the only phase that locks to the viewport with an inner scroll
  // region (Claude-style); landing/address/results keep natural page scroll.
  const locked = flow.phase === 'chat';

  return (
    <div className={`${styles.frame} ${locked ? styles.frameLocked : ''}`}>
      <AppHeader />
      {showStepper && stages && (
        <ProgressStepper
          stages={stages}
          declined={flow.declined}
          loading={flow.pending || flow.addressSubmitting}
        />
      )}
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
