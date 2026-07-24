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

// Whimsical Submit-button labels cycled while the seed request is in flight. The
// seed is one atomic /chat call (geocode + roof + first model turn), so the client
// gets no mid-flight signal — this is a TIMED simulation of the work happening
// server-side, not real telemetry. Phases map loosely to the backend steps:
// 0 geocode, 1 roof estimate, 2 precipitation, 3 hardiness, 4 first model turn.
const SUBMIT_PHRASES = [
  'Pinpointing your patch of earth…',
  'Peeking at your roof from space…',
  'Consulting the rain clouds…',
  'Sizing up your frostiest nights…',
  'Digging into the details…',
];
// Per-phase dwell times (ms): how long each phrase stays before advancing. The
// first ("Pinpointing…") lingers a beat longer; the rest are a touch slower than a
// plain rhythm so nothing flickers past. There is no entry for the final phrase
// (index 4) — it simply holds until the request returns. A fast request may never
// reach the later phrases, which is fine.
const SUBMIT_PHASE_DELAYS = [2600, 2400, 2400, 2400];
// "Pinpointing your patch of earth…" (phase 0) IS the address lookup, so the move
// off it — to phase 1 — is when the Address checkmark lands and Localized Data
// picks up the in-progress cursor.
export const SUBMIT_LOCALIZED_PHASE = 1;
export { SUBMIT_PHRASES };

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
  // Index into SUBMIT_PHRASES; the current button label + the simulated stepper
  // advance are both derived from it. Only meaningful while addressSubmitting.
  addressPhase: number;
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
  addressPhase: 0,
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
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire /warmup once on mount, fire-and-forget.
  useEffect(() => {
    void warmup();
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      if (submitTimer.current) clearTimeout(submitTimer.current);
    };
  }, []);

  // Advance the Submit-button phase while the seed request is in flight, using the
  // per-phase dwell times (chained timeouts, not a fixed interval, so the first
  // phrase can linger longer). Holds on the final phrase if the request outlasts
  // the sequence.
  const startSubmitTimer = useCallback(() => {
    if (submitTimer.current) clearTimeout(submitTimer.current);
    const schedule = (phase: number) => {
      if (phase >= SUBMIT_PHASE_DELAYS.length) return; // last phrase holds
      submitTimer.current = setTimeout(() => {
        setState((s) =>
          s.addressSubmitting && s.addressPhase < SUBMIT_PHRASES.length - 1
            ? { ...s, addressPhase: s.addressPhase + 1 }
            : s,
        );
        schedule(phase + 1);
      }, SUBMIT_PHASE_DELAYS[phase]);
    };
    schedule(0);
  }, []);

  const clearSubmitTimer = useCallback(() => {
    if (submitTimer.current) {
      clearTimeout(submitTimer.current);
      submitTimer.current = null;
    }
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
        addressPhase: 0,
        addressError: null,
        addressDetail: null,
      }));
      startSubmitTimer();
      seed(trimmed)
        .then((res) => {
          clearSubmitTimer();
          applyResponse(res);
        })
        .catch((e: unknown) => {
          clearSubmitTimer();
          const message = e instanceof ApiError ? e.message : 'Something went wrong.';
          setState((s) => ({
            ...s,
            addressSubmitting: false,
            addressError: 'error',
            addressDetail: message,
          }));
        });
    },
    [applyResponse, startSubmitTimer, clearSubmitTimer],
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
    clearSubmitTimer();
    setState(INITIAL);
  }, [clearPendingTimer, clearSubmitTimer]);

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
