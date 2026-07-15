'use client';

import { useMemo, useState } from 'react';
import type { Plant } from '@/lib/types';
import { useCopied } from '@/state/useCopied';
import { CopyIcon } from '../primitives/Icons';
import { InfoTooltip } from '../primitives/InfoTooltip';
import styles from './PlantOptions.module.scss';

type SortKey = 'common_name' | 'height_ft' | 'flower_color' | 'bloom_period' | 'moisture_use';
type ColDef = { key: SortKey; label: string; align: 'left' | 'center' };

const COLUMNS: ColDef[] = [
  { key: 'common_name', label: 'Common Name', align: 'left' },
  { key: 'height_ft', label: 'Height', align: 'center' },
  { key: 'flower_color', label: 'Color', align: 'left' },
  { key: 'bloom_period', label: 'Bloom Period', align: 'left' },
  { key: 'moisture_use', label: 'Moisture Use', align: 'left' },
];

const MOISTURE_RANK: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

export function PlantOptions({
  interior,
  perimeter,
  reason,
  onReturnToChat,
}: {
  interior: Plant[];
  perimeter: Plant[];
  reason?: string;
  onReturnToChat: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'interior' | 'perimeter'>('interior');
  const [sortCol, setSortCol] = useState<SortKey | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [tableCopied, copyTable] = useCopied();

  const noPlants = interior.length === 0 && perimeter.length === 0;

  const rows = useMemo(() => {
    const base = (activeTab === 'interior' ? interior : perimeter).slice();
    if (!sortCol) return base;
    const dir = sortDir === 'asc' ? 1 : -1;
    base.sort((a, b) => {
      let x: number | string;
      let y: number | string;
      if (sortCol === 'height_ft') {
        x = a.height_ft;
        y = b.height_ft;
      } else if (sortCol === 'moisture_use') {
        x = MOISTURE_RANK[a.moisture_use] ?? 0;
        y = MOISTURE_RANK[b.moisture_use] ?? 0;
      } else {
        x = String(a[sortCol]).toLowerCase();
        y = String(b[sortCol]).toLowerCase();
      }
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
    return base;
  }, [activeTab, interior, perimeter, sortCol, sortDir]);

  const switchTab = (tab: 'interior' | 'perimeter') => {
    setActiveTab(tab);
    setSortCol('');
    setSortDir('asc');
  };

  const sortBy = (col: SortKey) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const handleCopyTable = () => {
    if (!rows.length) return;
    const head = ['Common Name', 'Height', 'Flower Color', 'Bloom Period', 'Moisture Use'].join('\t');
    const body = rows.map((p) =>
      [p.common_name, `${p.height_ft} ft`, p.flower_color, p.bloom_period, p.moisture_use].join('\t'),
    );
    copyTable([head, ...body].join('\n'));
  };

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <h2 className={styles.h2}>Plant Options</h2>
        <InfoTooltip text="Interior plants go in the wetter center of the basin; perimeter plants ring the drier edge." />
      </div>
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'interior' ? styles.tabActive : ''}`}
            onClick={() => switchTab('interior')}
          >
            Interior Plants
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'perimeter' ? styles.tabActive : ''}`}
            onClick={() => switchTab('perimeter')}
          >
            Perimeter Plants
          </button>
          <button
            className={styles.copyTable}
            onClick={handleCopyTable}
            title="Copy table"
            aria-label="Copy table"
          >
            {tableCopied && <span className={styles.copied}>Copied</span>}
            <CopyIcon size={16} />
          </button>
        </div>

        {noPlants ? (
          <div className={styles.noPlants}>
            {reason ??
              'Based on the provided data, no plants are currently recommended for your rain garden.'}{' '}
            Feel free to{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onReturnToChat();
              }}
            >
              return to chat and edit your rain garden plans
            </a>{' '}
            further.
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headRow}>
                  {COLUMNS.map((c) => {
                    const isActive = sortCol === c.key;
                    const arrow = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '⇅';
                    return (
                      <th
                        key={c.key}
                        className={styles.th}
                        style={{ textAlign: c.align }}
                        onClick={() => sortBy(c.key)}
                      >
                        <span className={styles.thInner}>
                          {c.label}
                          <span
                            className={styles.arrow}
                            style={{
                              color: isActive
                                ? 'var(--color-accent-deep)'
                                : 'var(--color-secondary-light)',
                            }}
                          >
                            {arrow}
                          </span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={i} className={styles.bodyRow}>
                    <td className={`${styles.td} ${styles.tdName}`}>{p.common_name}</td>
                    <td className={styles.td} style={{ textAlign: 'center' }}>
                      {p.height_ft} ft
                    </td>
                    <td className={styles.td}>{p.flower_color}</td>
                    <td className={styles.td}>{p.bloom_period}</td>
                    <td className={styles.td}>{p.moisture_use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
