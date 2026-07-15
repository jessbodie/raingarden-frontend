'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, continueChat, seed, warmup } from '@/lib/api';
import type { ChatResponse, Outcome, Results, Stage } from '@/lib/types';

export type Phase = 'landing' | 'address' | 'chat' | 'results';
export type ChatEntry = { role: 'advisor' | 'user'; text: string };
export type AddressErrorKind = 'address_not_found' | 'out_of_region' | 'error' | null;

const PENDING_TEXT = 'percolating...';
const PENDING_TEXT_SLOW = 'still percolating, please be patient...';
const SLOW_AFTER_MS = 7000;

export type FlowState = {
  phase: Phase;
  // rendered chat transcript (NEVER built from `messages`)
  chatLog: ChatEntry[];
  stages: Stage[] | null;
  outcome: Outcome;
  results: Results | null;
  // chat sub-states
  pending: boolean;
  pendingText: string;
  chatError: boolean;
  declined: boolean;
  // address sub-states
  addressSubmitting: boolean;
  addressError: AddressErrorKind;
  addressDetail: string | null;
};

export type FlowActions = {
  goToAddress: () => void;
  submitAddress: (address: string) => void;
  sendMessage: (text: string) => void;
  retry: () => void;
  restart: () => void;
  returnToChat: () => void;
};

const INITIAL: FlowState = {
  phase: 'landing',
  chatLog: [],
  stages: null,
  outcome: null,
  results: null,
  pending: false,
  pendingText: PENDING_TEXT,
  chatError: false,
  declined: false,
  addressSubmitting: false,
  addressError: null,
  addressDetail: null,
};

export function useRainGardenFlow(): FlowState & FlowActions {
  const [state, setState] = useState<FlowState>(INITIAL);

  // Opaque transport state — kept in refs, never rendered.
  const wireMessages = useRef<unknown[]>([]);
  const roofSqft = useRef<number | null>(null);
  const lastUserMessage = useRef<string | null>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire /warmup once on mount, fire-and-forget.
  useEffect(() => {
    void warmup();
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, []);

  const startPendingTimer = useCallback(() => {
    if (slowTimer.current) clearTimeout(slowTimer.current);
    slowTimer.current = setTimeout(() => {
      setState((s) => (s.pending ? { ...s, pendingText: PENDING_TEXT_SLOW } : s));
    }, SLOW_AFTER_MS);
  }, []);

  const clearPendingTimer = useCallback(() => {
    if (slowTimer.current) {
      clearTimeout(slowTimer.current);
      slowTimer.current = null;
    }
  }, []);

  // Apply a successful ChatResponse to state + transport refs.
  const applyResponse = useCallback(
    (res: ChatResponse) => {
      wireMessages.current = res.messages ?? [];
      if (res.roof_sqft !== null && res.roof_sqft !== undefined) {
        roofSqft.current = res.roof_sqft;
      }

      setState((s) => {
        const stages = res.stages ?? s.stages;

        // Terminal error turn (HTTP 500 with a structured status).
        if (res.status === 'error') {
          return { ...s, phase: 'chat', stages, pending: false, chatError: true };
        }

        // Seed-time address rejections — stay on the Address screen.
        if (res.status === 'address_not_found' || res.status === 'out_of_region') {
          return {
            ...s,
            phase: 'address',
            stages,
            addressSubmitting: false,
            addressError: res.status,
            addressDetail: res.detail,
          };
        }

        if (res.status === 'complete') {
          if (res.outcome === 'declined') {
            // No plan — closing message in chat, freeze stepper, offer restart.
            const chatLog = res.assistant_message
              ? [...s.chatLog, { role: 'advisor' as const, text: res.assistant_message }]
              : s.chatLog;
            return {
              ...s,
              phase: 'chat',
              stages,
              chatLog,
              outcome: res.outcome,
              results: null,
              pending: false,
              chatError: false,
              declined: true,
            };
          }
          // plan / plan_not_recommended → results screen.
          return {
            ...s,
            phase: 'results',
            stages,
            outcome: res.outcome,
            results: res.results,
            pending: false,
            chatError: false,
          };
        }

        // awaiting_user — push the advisor turn and show the input.
        const chatLog = res.assistant_message
          ? [...s.chatLog, { role: 'advisor' as const, text: res.assistant_message }]
          : s.chatLog;
        return {
          ...s,
          phase: 'chat',
          stages,
          chatLog,
          outcome: null,
          results: null,
          pending: false,
          chatError: false,
          declined: false,
          addressSubmitting: false,
          addressError: null,
        };
      });
    },
    [],
  );

  const goToAddress = useCallback(() => {
    setState((s) => ({ ...s, phase: 'address', addressError: null, addressDetail: null }));
  }, []);

  const submitAddress = useCallback(
    (address: string) => {
      const trimmed = address.trim();
      if (!trimmed) return;
      setState((s) => ({
        ...s,
        addressSubmitting: true,
        addressError: null,
        addressDetail: null,
      }));
      seed(trimmed)
        .then(applyResponse)
        .catch((e: unknown) => {
          const message = e instanceof ApiError ? e.message : 'Something went wrong.';
          setState((s) => ({
            ...s,
            addressSubmitting: false,
            addressError: 'error',
            addressDetail: message,
          }));
        });
    },
    [applyResponse],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      lastUserMessage.current = trimmed;
      setState((s) => ({
        ...s,
        chatLog: [...s.chatLog, { role: 'user', text: trimmed }],
        pending: true,
        pendingText: PENDING_TEXT,
        chatError: false,
      }));
      startPendingTimer();
      continueChat(wireMessages.current, trimmed, roofSqft.current)
        .then((res) => {
          clearPendingTimer();
          applyResponse(res);
        })
        .catch(() => {
          clearPendingTimer();
          setState((s) => ({ ...s, pending: false, chatError: true }));
        });
    },
    [applyResponse, startPendingTimer, clearPendingTimer],
  );

  // Retry re-sends the identical continue request (messages unchanged).
  const retry = useCallback(() => {
    const msg = lastUserMessage.current;
    if (!msg) return;
    setState((s) => ({ ...s, pending: true, pendingText: PENDING_TEXT, chatError: false }));
    startPendingTimer();
    continueChat(wireMessages.current, msg, roofSqft.current)
      .then((res) => {
        clearPendingTimer();
        applyResponse(res);
      })
      .catch(() => {
        clearPendingTimer();
        setState((s) => ({ ...s, pending: false, chatError: true }));
      });
  }, [applyResponse, startPendingTimer, clearPendingTimer]);

  const restart = useCallback(() => {
    wireMessages.current = [];
    roofSqft.current = null;
    lastUserMessage.current = null;
    clearPendingTimer();
    setState(INITIAL);
  }, [clearPendingTimer]);

  // From the no-plants results screen: go back to the chat to refine (input re-enabled).
  const returnToChat = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'chat',
      outcome: null,
      results: null,
      declined: false,
      chatError: false,
    }));
  }, []);

  return {
    ...state,
    goToAddress,
    submitAddress,
    sendMessage,
    retry,
    restart,
    returnToChat,
  };
}
