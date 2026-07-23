import { InfoCircleIcon } from './Icons';

// Info-circle with a native title tooltip (matches the prototype's affordance).
export function InfoTooltip({ text, size = 17 }: { text: string; size?: number }) {
  return (
    <span style={{ cursor: 'help', display: 'inline-flex' }} title={text}>
      <InfoCircleIcon size={size} style={{ stroke: 'var(--color-primary)' }} />
    </span>
  );
}
