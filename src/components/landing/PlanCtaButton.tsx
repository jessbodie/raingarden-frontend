'use client';

import { useFlow } from '@/state/FlowContext';
import { PrimaryButton } from '../primitives/PrimaryButton';

// The landing CTA lives inside the SSR landing but must trigger the client flow.
export function PlanCtaButton({ label = 'Plan my rain garden' }: { label?: string }) {
  const flow = useFlow();
  return <PrimaryButton onClick={flow.goToAddress}>{label}</PrimaryButton>;
}
