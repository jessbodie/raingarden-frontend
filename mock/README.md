# Mock backend

A zero-dependency Node server that mimics the Rain Garden Advisor API using the
canned payloads from `docs/API_SAMPLES_FOR_DESIGN.md §2`. Use it to click through
**every** UI state locally at zero token cost — no Python backend, no LLM calls,
no CORS setup (it sends permissive CORS headers itself).

## Run

Two terminals:

```
npm run mock     # terminal 1 — mock backend on http://localhost:8000
npm run dev      # terminal 2 — frontend on http://localhost:3000/raingarden
```

`.env.local` already points at `http://localhost:8000`, so nothing else to change.
(Custom port: `PORT=8123 npm run mock` + update `NEXT_PUBLIC_API_BASE_URL`.)

## Which state you get is chosen by the ADDRESS you submit

| Address contains… | Terminal state |
|---|---|
| *(anything else)* | ✅ Recommended **plan** |
| `clay` or `notrec` | ⚠️ **Not recommended** (blocking + corrective + reduction advisories) |
| `decline` or `slow` | 🛑 **Declined** — no plan, stepper freezes |
| `noplant` or `barren` | 🌱 Plan with **empty plant lists** (no-plants state) |
| `nowhere` / `notfound` / `asdf` | **Address not found** (stay on Address) |
| `canada` / `alaska` / `hawaii` / `ocean` | **Out of region** |

Then just answer the chat prompts (any text) — after the scripted questions the
mock returns that scenario's terminal payload. The stepper advances as you go.

## Testing the chat error + retry state

In any conversation, send a message containing the word **`error`**. The mock
returns `status: "error"`; click the retry button (which re-sends the identical
request) and it succeeds — exactly the real retry contract.

## Not a substitute for the live run

The mock exercises the frontend against the real *response shapes*. It does not
run the real LLM, geocoder, or calculators. For a true end-to-end check, point
`NEXT_PUBLIC_API_BASE_URL` at the live/local FastAPI backend (which requires
`ALLOWED_ORIGINS` to include `http://localhost:3000`).
