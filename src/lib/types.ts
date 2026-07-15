// TypeScript contract for the Rain Garden Advisor API.
// Verbatim from docs/FRONTEND_INTEGRATION.md §5 (the backend is the source of truth).

// ---- Transport ----
export type Stage = {
  id: 'address' | 'localized_data' | 'site_conditions' | 'growing_conditions' | 'plan';
  label: string;
  state: 'not_started' | 'in_progress' | 'complete';
};

export type Severity = 'blocking' | 'corrective' | 'informational';

export type Advisory = {
  type: string; // e.g. 'foundation_setback', 'utilities'
  severity: Severity; // drives color
  message: string;
  corrective_action?: string; // present only on viability advisories; ignore for display
};

export type Plant = {
  common_name: string;
  height_ft: number;
  flower_color: string;
  bloom_period: string;
  moisture_use: string; // "Moisture Use", NOT "Drought Tolerance"
};

export type DepthOption = {
  depth_in: number; // 4 | 6 | 8
  band: string; // '3-5' | '6-7' | '8' (not displayed)
  area_sqft: number;
  interior_plants: number;
  perimeter_plants: number;
  advisories: Advisory[]; // depth-DEPENDENT advisories for this option
  summary: string; // per-option prose (already numerically injected)
};

export type Results = {
  recommended: boolean; // false → not-recommended layout
  sizing: { options: DepthOption[]; advisories: Advisory[] }; // sizing.advisories = depth-invariant
  advisories: Advisory[]; // site-wide advisories
  gallons_per_year: number | null; // depth-invariant; format with commas
  plants?: { interior: Plant[]; perimeter: Plant[]; reason?: string }; // may be empty → "no plants"
};

export type ChatStatus =
  | 'awaiting_user'
  | 'complete'
  | 'address_not_found'
  | 'out_of_region'
  | 'error';

export type Outcome = 'plan' | 'plan_not_recommended' | 'declined' | null;

export type ChatResponse = {
  status: ChatStatus;
  outcome: Outcome; // set only when status === 'complete'
  messages: unknown[]; // OPAQUE — hold & resend, never render
  assistant_message: string | null;
  results: Results | null;
  detail: string | null; // error / out-of-region text
  roof_sqft: number | null; // echo back every continue
  stages: Stage[] | null; // the 5-stage stepper
};

// ---- Request ----
export type SeedRequest = { address: string };
export type ContinueRequest = {
  messages: unknown[];
  user_message: string;
  roof_sqft: number | null;
};
export type ChatRequest = SeedRequest | ContinueRequest;

export type WarmupResponse = { status: string };
