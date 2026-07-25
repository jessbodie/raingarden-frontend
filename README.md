# Rain Garden Advisor — Frontend

Next.js (App Router) frontend for the Rain Garden Advisor. It calls the existing
Python/FastAPI backend and renders the flow — it never recomputes anything.

Mounted at `jessbodie.com/raingarden` (`basePath: '/raingarden'`), served from Vercel.

## Stack
- Next.js 15 (App Router) · TypeScript · **SCSS Modules** (not Tailwind)
- Montserrat via `next/font/google` (weights 400/500/600/700)
- Design tokens in `src/styles/tokens.scss` (used as-is; components read `var(--…)`)
- Light theme only for v1 (tokens kept theme-able for a later dark drop-in)

## Architecture
- **Landing** (`/`) is a real, server-rendered, indexable route (metadata + JSON-LD).
- **Address → Chat → Results** is client state within one flow controller.
- The backend is **client-stateless**: the browser holds the opaque `messages` array
  and resends it every turn (`src/state/useRainGardenFlow.ts`). It is never parsed or
  rendered — a separate `chatLog` (built from `assistant_message` + the user's own
  inputs) is what the chat UI shows. `roof_sqft` is echoed back on every continue.

Key files:
- `src/lib/types.ts` — the API contract (mirrors the backend).
- `src/lib/api.ts` — `warmup()` / `seed()` / `continueChat()`.
- `src/state/useRainGardenFlow.ts` — the client-stateless state machine.
- `src/components/{chrome,landing,address,chat,results,primitives}` — the UI.

## Config

This app has **one** env var and holds **no secrets** (every API key — Anthropic,
RapidAPI, Google Solar — lives on the backend). Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Pick the base URL to suit:

| Target | URL |
|---|---|
| Real local backend | `http://localhost:8000` (`uvicorn app:app --reload`) |
| Mock backend | `http://localhost:8001` (`npm run mock` — no token cost) |
| Deployed (Render) | `https://rain-garden-advisor-api.onrender.com` |

On Vercel, set `NEXT_PUBLIC_API_BASE_URL` in the project's environment variables.

> ⚠️ `NEXT_PUBLIC_*` vars are inlined into the browser bundle — never put a secret
> behind that prefix.

CORS is configured on the **backend**, not here: `raingardentool/.env` →
`ALLOWED_ORIGINS=http://localhost:3000,https://jessbodie.com`.

## Develop
```
npm install
npm run dev      # http://localhost:3000/raingarden
npm run build
```

## Run in mock mode to simulate backend (no token cost)
Switch the active line in `.env.local` to `http://localhost:8001`. (The mock
uses 8001 so it can't silently shadow the real backend on 8000.)
Then from the frontend root, run both:
```
npm run mock     # terminal 1 — canned API on http://localhost:8001
npm run dev      # terminal 2
```
The terminal UI state is chosen by the address you enter (e.g. an address with
`clay` → not-recommended, `decline` → declined, `noplant` → no-plants,
`nowhere` → address-not-found, `hawaii` → out-of-region). Send a chat message
containing `error` to test the retry state. See `mock/README.md`.

## Pending copy (PLACEHOLDER)
Two blocks on the landing page are placeholders awaiting final copy:
- **About Me** bio (`src/components/landing/LandingScreen.tsx`)
- **Credits & Sources** list (`src/components/landing/CreditsDisclosure.tsx`) —
  the home for the RAG guidance source citations.
