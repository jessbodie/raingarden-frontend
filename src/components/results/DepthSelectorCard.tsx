'use client';

import type { DepthOption } from '@/lib/types';
import { PrimaryButton } from '../primitives/PrimaryButton';
import styles from './DepthSelectorCard.module.scss';

function Metric({ value, unit }: { value: number; unit: string }) {
  return (
    <span className={styles.metric}>
      <span className={styles.metricNum}>{value}</span>
      <span className={styles.metricUnit}>{unit}</span>
    </span>
  );
}

export function DepthSelectorCard({
  options,
  selectedDepth,
  confirmed,
  onPick,
  onConfirm,
}: {
  options: DepthOption[];
  selectedDepth: number;
  confirmed: boolean;
  onPick: (depth: number) => void;
  onConfirm: () => void;
}) {
  const selected = options.find((o) => o.depth_in === selectedDepth) ?? options[0];

  if (confirmed) {
    return (
      <div className={styles.card}>
        <p className={styles.heading}>Your rain garden dimensions:</p>
        <div className={styles.confirmedRow}>
          <span className={`${styles.radio} ${styles.radioOn}`}>
            <span className={styles.dot} />
          </span>
          <Metric value={selected.depth_in} unit="inches" />
          <Metric value={selected.area_sqft} unit="sq ft" />
          <Metric value={selected.interior_plants} unit="interior" />
          <Metric value={selected.perimeter_plants} unit="perimeter" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.heading}>Evaluate the options for your rain garden dimensions:</p>
      <div className={styles.rows}>
        {options.map((o) => {
          const isSel = o.depth_in === selectedDepth;
          return (
            <button
              key={o.depth_in}
              className={`${styles.row} ${isSel ? styles.rowSelected : ''}`}
              onClick={() => onPick(o.depth_in)}
            >
              <span className={`${styles.radio} ${isSel ? styles.radioOn : ''}`}>
                {isSel && <span className={styles.dot} />}
              </span>
              <Metric value={o.depth_in} unit="inches" />
              <Metric value={o.area_sqft} unit="sq ft" />
              <Metric value={o.interior_plants} unit="interior" />
              <Metric value={o.perimeter_plants} unit="perimeter" />
            </button>
          );
        })}
      </div>
      <div className={styles.actions}>
        <PrimaryButton size="sm" onClick={onConfirm}>
          Confirm the Plan
        </PrimaryButton>
      </div>
    </div>
  );
}
