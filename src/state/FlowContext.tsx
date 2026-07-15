'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useRainGardenFlow, type FlowActions, type FlowState } from './useRainGardenFlow';

type FlowValue = FlowState & FlowActions;

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const flow = useRainGardenFlow();
  return <FlowContext.Provider value={flow}>{children}</FlowContext.Provider>;
}

export function useFlow(): FlowValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used within a FlowProvider');
  return ctx;
}
