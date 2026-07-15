// Zero-dependency mock of the Rain Garden Advisor backend.
// Serves canned ChatResponse payloads (verbatim shapes from
// docs/API_SAMPLES_FOR_DESIGN.md §2) so the frontend can be exercised through
// EVERY state at zero token cost. Includes permissive CORS (the whole point:
// no CORS hassle for local UI work).
//
//   node mock/server.js            # listens on :8000
//   PORT=8123 node mock/server.js  # custom port
//
// Then in .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
//
// The TERMINAL state is chosen by keywords in the address you submit:
//   (default)                 -> recommended plan
//   "clay" / "notrec"         -> plan_not_recommended
//   "decline" / "slow"        -> declined (no plan; stepper freezes)
//   "noplant" / "barren"      -> plan with empty plant lists (no-plants state)
//   "nowhere" / "notfound"    -> address_not_found  (stay on Address)
//   "canada" / "alaska" / "hawaii" / "ocean" -> out_of_region
// In chat, type a message containing "error" to see the error+retry state
// (the retry then succeeds).

const http = require('http');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const LATENCY_MS = 650; // so the "percolating…" spinner is visible

// ---------- stage helpers ----------
const S = ['address', 'localized_data', 'site_conditions', 'growing_conditions', 'plan'];
const LABELS = ['Address', 'Localized Data', 'Site Conditions', 'Growing Conditions', 'Rain Garden Plan'];
function stages(states) {
  return S.map((id, i) => ({ id, label: LABELS[i], state: states[i] }));
}
const ST_SITE = ['complete', 'complete', 'in_progress', 'not_started', 'not_started'];
const ST_GROWING = ['complete', 'complete', 'complete', 'in_progress', 'not_started'];
const ST_ALL = ['complete', 'complete', 'complete', 'complete', 'complete'];
const ST_ADDR = ['in_progress', 'not_started', 'not_started', 'not_started', 'not_started'];

// ---------- canned results payloads (§2b / §2c / no-plants) ----------
const PLANTS_FULL = {
  interior: [
    { common_name: 'Blue Flag Iris', bloom_period: 'Spring', flower_color: 'Blue', height_ft: 3, moisture_use: 'High' },
    { common_name: 'Swamp Milkweed', bloom_period: 'Summer', flower_color: 'Pink', height_ft: 4, moisture_use: 'High' },
    { common_name: 'Cardinal Flower', bloom_period: 'Late Summer', flower_color: 'Red', height_ft: 3, moisture_use: 'High' },
  ],
  perimeter: [
    { common_name: 'Black-Eyed Susan', bloom_period: 'Summer', flower_color: 'Yellow', height_ft: 3, moisture_use: 'Medium' },
    { common_name: 'Purple Coneflower', bloom_period: 'Summer', flower_color: 'Purple', height_ft: 4, moisture_use: 'Medium' },
    { common_name: 'Little Bluestem', bloom_period: 'Fall', flower_color: 'Bronze', height_ft: 3, moisture_use: 'Low' },
  ],
};

const RESULTS_PLAN = {
  recommended: true,
  sizing: {
    options: [
      { depth_in: 4, band: '3-5', area_sqft: 192, interior_plants: 87, perimeter_plants: 21, advisories: [], summary: 'At about 4 inches deep, your rain garden should cover roughly 192 sq ft. Plan for 87 plants in the wetter center and 21 around the drier edge. It captures roughly 15709 gallons of runoff a year from about 600 sq ft of catchment.' },
      { depth_in: 6, band: '6-7', area_sqft: 144, interior_plants: 63, perimeter_plants: 18, advisories: [], summary: 'At about 6 inches deep, your rain garden should cover roughly 144 sq ft. Plan for 63 plants in the wetter center and 18 around the drier edge. It captures roughly 15709 gallons of runoff a year from about 600 sq ft of catchment.' },
      { depth_in: 8, band: '8', area_sqft: 90, interior_plants: 37, perimeter_plants: 14, advisories: [], summary: 'At about 8 inches deep, your rain garden should cover roughly 90 sq ft. Plan for 37 plants in the wetter center and 14 around the drier edge. It captures roughly 15709 gallons of runoff a year from about 600 sq ft of catchment.' },
    ],
    advisories: [],
  },
  advisories: [
    { type: 'utilities', severity: 'informational', message: 'Check for underground utilities before digging.' },
    { type: 'roof_estimate', severity: 'informational', message: "The satellite roof estimate reflects your entire roof's footprint — not the catchment area for this specific downspout. Most homes have more than one gutter and downspout, each carrying only part of the total roof runoff." },
  ],
  gallons_per_year: 15709,
  plants: PLANTS_FULL,
};

const RESULTS_NOTREC = {
  recommended: false,
  sizing: {
    options: [
      { depth_in: 4, band: '3-5', area_sqft: 448, interior_plants: 224, perimeter_plants: 29, advisories: [{ type: 'split_ceiling', severity: 'informational', message: 'At over 300 sq ft this is large for a single basin — consider dividing it into two or more smaller rain gardens.' }], summary: 'At about 4 inches deep, your rain garden should cover roughly 448 sq ft. Plan for 224 plants in the wetter center and 29 around the drier edge. It captures roughly 36654 gallons of runoff a year from about 1400 sq ft of catchment.' },
      { depth_in: 6, band: '6-7', area_sqft: 336, interior_plants: 163, perimeter_plants: 27, advisories: [{ type: 'split_ceiling', severity: 'informational', message: 'At over 300 sq ft this is large for a single basin — consider dividing it into two or more smaller rain gardens.' }], summary: 'At about 6 inches deep, your rain garden should cover roughly 336 sq ft. Plan for 163 plants in the wetter center and 27 around the drier edge. It captures roughly 36654 gallons of runoff a year from about 1400 sq ft of catchment.' },
      { depth_in: 8, band: '8', area_sqft: 224, interior_plants: 104, perimeter_plants: 23, advisories: [], summary: 'At about 8 inches deep, your rain garden should cover roughly 224 sq ft. Plan for 104 plants in the wetter center and 23 around the drier edge. It captures roughly 36654 gallons of runoff a year from about 1400 sq ft of catchment.' },
    ],
    advisories: [
      { type: 'reduction_allowance', severity: 'informational', message: "Any of these can be shrunk by up to 30% and still control about 90% of the yearly runoff — handy if the full size won't fit your yard." },
    ],
  },
  advisories: [
    { type: 'foundation_setback', severity: 'blocking', corrective_action: 'relocate_min_10ft', message: 'Site the rain garden at least 10 ft from the foundation.' },
    { type: 'clayey_unverified', severity: 'corrective', corrective_action: 'test_and_amend', message: 'Clayey soil: verify drainage is at least 0.5 in/hr; amend until it is.' },
    { type: 'utilities', severity: 'informational', message: 'Check for underground utilities before digging.' },
  ],
  gallons_per_year: 36654,
  plants: {
    interior: [
      { common_name: 'Blue Flag Iris', bloom_period: 'Spring', flower_color: 'Blue', height_ft: 3, moisture_use: 'High' },
      { common_name: 'Swamp Milkweed', bloom_period: 'Summer', flower_color: 'Pink', height_ft: 4, moisture_use: 'High' },
    ],
    perimeter: [
      { common_name: 'Black-Eyed Susan', bloom_period: 'Summer', flower_color: 'Yellow', height_ft: 3, moisture_use: 'Medium' },
      { common_name: 'Switchgrass', bloom_period: 'Fall', flower_color: 'Green', height_ft: 5, moisture_use: 'Low' },
    ],
  },
};

// no-plants: a valid recommended plan but empty plant lists + a reason.
const RESULTS_NOPLANTS = {
  ...RESULTS_PLAN,
  plants: { interior: [], perimeter: [], reason: 'No plants in the dataset matched this site’s hardiness zone and moisture profile.' },
};

// ---------- scripted conversations ----------
// intermediate advisor turns (after the seed turn), then a terminal payload.
const SCENARIOS = {
  plan: {
    roof: 1740,
    intermediates: [
      { text: 'Perfect, 600 sq ft it is. A couple of quick site questions. About how far is the spot from your house foundation — under 10 ft, 10 to 30 ft, or more than 30 ft?', states: ST_SITE },
      { text: 'Good — that’s a safe distance. Is the ground there fairly flat, or does it slope? If it slopes, does it run toward the house or away from it?', states: ST_SITE },
      { text: 'That’s an ideal setup. Last couple: what’s the soil like there — sandy, clay, loamy? And how much sun does the spot get?', states: ST_GROWING },
    ],
    terminal: () => ({ status: 'complete', outcome: 'plan', assistant_message: "Here's your rain garden plan. At about 4 inches deep it covers roughly 192 sq ft; going deeper to 8 inches shrinks it to about 90 sq ft if space is tight. I've split the planting into a wetter center and a drier edge, and pulled a native plant list suited to your zone. A few things to check before you dig are noted below.", results: RESULTS_PLAN, roof_sqft: 1740, detail: null, states: ST_ALL }),
  },
  notrec: {
    roof: null,
    intermediates: [
      { text: 'Thanks. About how far is the spot from your house foundation — under 10 ft, 10 to 30 ft, or more than 30 ft?', states: ST_SITE },
      { text: 'Siting a rain garden less than 10 feet from the foundation isn’t recommended — water pooling that close can risk it. Would you like me to design it anyway, with that caution front and center?', states: ST_SITE },
    ],
    terminal: () => ({ status: 'complete', outcome: 'plan_not_recommended', assistant_message: "I've put together a plan, but I want to be upfront: siting a rain garden less than 10 feet from your foundation isn't recommended — water pooling that close can risk your foundation. If you're able to move it farther out, that's the safer choice. Here's the design in case you decide to proceed, with that caution kept front and center.", results: RESULTS_NOTREC, roof_sqft: null, detail: null, states: ST_ALL }),
  },
  declined: {
    roof: 1740,
    intermediates: [
      { text: 'Thanks. Have you tested how fast water drains where you’re thinking of putting it?', states: ST_SITE },
      { text: 'Drainage that slow really isn’t a good candidate without significant soil work. Would you still like to proceed?', states: ST_SITE },
    ],
    terminal: () => ({ status: 'complete', outcome: 'declined', assistant_message: "That's completely understandable — a spot with drainage this slow really isn't a good candidate for a rain garden without significant soil work, and it's better to know that now than after digging. If you ever amend the soil or pick a different part of the yard, I'd be glad to help you plan it then. Thanks for thinking about managing your stormwater the green way.", results: null, roof_sqft: 1740, detail: null, states: ST_SITE }),
  },
  noplants: {
    roof: 1740,
    intermediates: [
      { text: 'Perfect. About how far is the spot from your house foundation — under 10 ft, 10 to 30 ft, or more than 30 ft?', states: ST_SITE },
      { text: 'Good. And what’s the soil like — sandy, clay, loamy — and how much sun does it get?', states: ST_GROWING },
    ],
    terminal: () => ({ status: 'complete', outcome: 'plan', assistant_message: "Here's your rain garden plan and sizing. I wasn't able to match native plants to this exact site profile from the dataset — you can adjust your inputs and try again for a plant list.", results: RESULTS_NOPLANTS, roof_sqft: 1740, detail: null, states: ST_ALL }),
  },
};

const SEED_MESSAGE =
  "Great — I've pulled your local rainfall and hardiness data. Now, how big is the area draining to this spot? A satellite look at your roof suggests about 1740 sq ft of total roof footprint — but that's the whole roof, and your downspout only carries part of it. You can give me your own number, or tell me to use that estimate.";

function pickScenario(address) {
  const a = (address || '').toLowerCase();
  if (/nowhere|notfound|asdf|xxx/.test(a)) return { reject: 'address_not_found', detail: "I couldn't find that address. Please check it and try again." };
  if (/canada|mexico|alaska|hawaii|ocean|puerto/.test(a)) return { reject: 'out_of_region', detail: 'This tool currently supports the contiguous lower-48 US states only.' };
  if (/clay|notrec|foundation/.test(a)) return { scenario: 'notrec' };
  if (/decline|slow|drain/.test(a)) return { scenario: 'declined' };
  if (/noplant|barren/.test(a)) return { scenario: 'noplants' };
  return { scenario: 'plan' };
}

// ephemeral server memory: arm the error trigger so the retry (identical
// request) succeeds the second time.
let errorArmed = false;

function build(res, body) {
  return { status: 'awaiting_user', outcome: null, assistant_message: null, results: null, detail: null, roof_sqft: null, messages: [], stages: null, ...body };
}

function handleChat(payload) {
  // seed
  if (payload && typeof payload.address === 'string' && !payload.messages) {
    const pick = pickScenario(payload.address);
    if (pick.reject) {
      return build(null, { status: pick.reject, detail: pick.detail, messages: [], stages: stages(ST_ADDR) });
    }
    const sc = SCENARIOS[pick.scenario];
    return build(null, {
      status: 'awaiting_user',
      assistant_message: SEED_MESSAGE,
      roof_sqft: sc.roof,
      messages: [{ _mock: { scenario: pick.scenario, turn: 0 } }],
      stages: stages(ST_SITE),
    });
  }

  // continue
  const meta = (Array.isArray(payload.messages) && payload.messages[0] && payload.messages[0]._mock) || { scenario: 'plan', turn: 0 };
  const userMsg = String(payload.user_message || '');

  // error+retry demo: first "error" message fails, the retry succeeds.
  if (/error/i.test(userMsg)) {
    if (!errorArmed) {
      errorArmed = true;
      return build(null, { status: 'error', detail: 'Something went wrong on our end. Please retry in a moment.', messages: payload.messages, stages: stages(ST_SITE) });
    }
    errorArmed = false; // fall through and advance normally on retry
  }

  const sc = SCENARIOS[meta.scenario] || SCENARIOS.plan;
  const nextTurn = meta.turn + 1;
  const inter = sc.intermediates;

  if (nextTurn <= inter.length) {
    const step = inter[nextTurn - 1];
    return build(null, {
      status: 'awaiting_user',
      assistant_message: step.text,
      roof_sqft: sc.roof,
      messages: [{ _mock: { scenario: meta.scenario, turn: nextTurn } }],
      stages: stages(step.states),
    });
  }

  // terminal
  const t = sc.terminal();
  return {
    status: t.status,
    outcome: t.outcome,
    assistant_message: t.assistant_message,
    results: t.results,
    detail: t.detail,
    roof_sqft: t.roof_sqft,
    messages: [{ _mock: { scenario: meta.scenario, turn: nextTurn } }],
    stages: stages(t.states),
  };
}

// ---------- http plumbing ----------
const server = http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify(obj));
  };

  if (req.method === 'POST' && req.url === '/warmup') {
    send(200, { status: 'warm' });
    return;
  }
  if (req.method === 'POST' && req.url === '/chat') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        send(400, { status: 'error', detail: 'Bad JSON' });
        return;
      }
      const out = handleChat(payload);
      setTimeout(() => send(200, out), payload.address ? 0 : LATENCY_MS);
    });
    return;
  }
  send(404, { status: 'error', detail: 'Not found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[mock] Rain Garden Advisor mock backend on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log('[mock] address keywords: clay/notrec, decline/slow, noplant/barren, nowhere/notfound, canada/alaska; chat "error" to test retry');
});
