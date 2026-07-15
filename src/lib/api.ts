import { API_BASE_URL } from './config';
import type { ChatResponse, WarmupResponse } from './types';

// Thrown when the request itself fails (network error, non-OK HTTP that isn't a
// structured ChatResponse). The flow surfaces this as a chat-error condition.
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiError(e instanceof Error ? e.message : 'Network request failed');
  }
  if (!res.ok) {
    // The API returns structured errors as JSON with `detail`; a 500 chat turn
    // still carries a ChatResponse-ish body. Try to parse before giving up.
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.detail === 'string') detail = data.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail);
  }
  return (await res.json()) as T;
}

// Fire once on app load, fire-and-forget. Preloads RAG singletons so the first
// plan doesn't eat model-load latency. Never gate anything on this.
export function warmup(): Promise<WarmupResponse | void> {
  return postJson<WarmupResponse>('/warmup', {}).catch(() => {
    /* best-effort: any request wakes the container regardless */
  });
}

// Seed (first turn) — address only.
export function seed(address: string): Promise<ChatResponse> {
  return postJson<ChatResponse>('/chat', { address });
}

// Continue — resend the opaque transcript + new answer + echoed roof estimate.
export function continueChat(
  messages: unknown[],
  user_message: string,
  roof_sqft: number | null,
): Promise<ChatResponse> {
  return postJson<ChatResponse>('/chat', { messages, user_message, roof_sqft });
}
