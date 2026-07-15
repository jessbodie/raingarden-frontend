import type { Advisory, Severity } from './types';

// Severity → color token (DESIGN_SPEC §2.1). These are the ACTUAL CSS custom
// properties emitted by tokens.scss. Severity drives COLOR ONLY, never routing.
//   blocking       → error tone  #8F3A2E  (--color-error)
//   corrective     → coral       #F56E48  (--color-tertiary)
//   informational  → steel blue  #5B85AA  (--color-secondary)
export const SEVERITY_COLOR_VAR: Record<Severity, string> = {
  blocking: 'var(--color-error)',
  corrective: 'var(--color-tertiary)',
  informational: 'var(--color-secondary)',
};

export function severityColor(severity: Severity): string {
  return SEVERITY_COLOR_VAR[severity] ?? 'var(--color-secondary)';
}

// Merge the three advisory sources for the plan card, in display order:
// site-wide → depth-invariant sizing → the selected depth option's advisories.
export function mergedAdvisories(
  site: Advisory[],
  sizing: Advisory[],
  selectedOption: Advisory[],
): Advisory[] {
  return [...site, ...sizing, ...selectedOption];
}
