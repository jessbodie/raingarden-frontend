# Rain Garden Advisor — Frontend

The Next.js frontend for the Rain Garden Advisor. It calls the Python API and renders;
it never recomputes anything. The deterministic core, agent loop, and API live in the
sibling `raingardentool` repo — see that repo's `CLAUDE.md` for architecture, and its
`docs/` (`DESIGN_SPEC.md`, `API_SAMPLES_FOR_DESIGN.md`, `FRONTEND_INTEGRATION.md`) for the
brand system, real `ChatResponse` payloads, and the transport contract.

## Stack & conventions

- **Next.js (App Router) + SCSS Modules** (not Tailwind). Light theme only for v1
  (tokens in `src/styles/tokens.scss` are kept theme-able).
- **basePath `/raingarden`** (`next.config.js`, mirrored in `src/lib/config.ts`
  `BASE_PATH`). The app is served at `jessbodie.com/raingarden`. Assets referenced
  outside `next/image` must go through the `asset()` helper — Next does not rewrite
  plain `<img src>` / CSS `url()` with basePath.
- **Client-stateless transport.** The `messages` transcript IS the conversation state:
  the browser holds it and resends it every turn (`src/state/useRainGardenFlow.ts`).
  The rendered chat log is built from `assistant_message`, NEVER from `messages`. The
  exact roof estimate rides out of band on `roof_sqft`, never inside `messages`.
- **Progress stepper** and terminal screen (plan / plan_not_recommended / declined) are
  driven by the API's `stages` + `outcome` + `recommended`, never by a transcript scan.

## Running locally

Two processes. `.env.local` points the frontend at ONE API (it's read only at
`npm run dev` startup — restart after changing it):

- `npm run dev` → the site at `http://localhost:3000/raingarden` (this is the only URL
  that serves a page; `:8000`/`:8001` are APIs, not pages).
- `npm run mock` → zero-token mock backend on `:8001` (`mock/server.js`). Canned payloads
  for every UI state; address keywords select the scenario (default = recommended plan;
  `clay`/`notrec`, `decline`/`slow`, `noplant`, `nowhere`, `canada`; chat "error" tests
  retry). It ignores answer content and advances the scripted conversation by turn count.
  Response delays (`MOCK_SEED_MS`/`MOCK_CHAT_MS`/`MOCK_FINALE_MS`) are tuned so the timed
  address-submit and finale animations are visible; set them to 0 for instant responses.
- Real local backend: `cd ../raingardentool && .venv/Scripts/uvicorn app:app --reload`
  (port 8000) — real data, real LLM calls (costs tokens). Use the mock for UI work.

## Gotchas

- **`@keyframes` used by a `.module.scss` file MUST be defined in that same module.**
  Next's CSS-module loader scopes animation *names*, so a module referencing a keyframe
  defined in the global `globals.scss` gets rewritten to a hashed local name that does
  not exist — the animation silently no-ops (no error). This bit the percolating spinner
  and the progress-stepper ring: both referenced the global `rga-spin` and did nothing
  until the keyframe was moved into their own modules. `:global(name)` in the `animation`
  value does NOT work — Dart Sass parses the file first and rejects `:global()` in a
  property value. Global keyframes only work for global (non-module) classes like the
  `rga-fu` fade-ups. If a module needs an animation, define its `@keyframes` locally.
- **Reduce-motion is a real off-switch.** `globals.scss` disables all CSS animation under
  `@media (prefers-reduced-motion: reduce)` (`* { animation: none !important }`). If an
  animation "doesn't show," rule out a keyframe-scoping bug (above) first, then check the
  OS setting / DevTools → Rendering → emulate `prefers-reduced-motion`.
