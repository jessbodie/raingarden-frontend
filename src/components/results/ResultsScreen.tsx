'use client';

import { useState } from 'react';
import { useFlow } from '@/state/FlowContext';
import { mergedAdvisories, severityColor } from '@/lib/advisories';
import { DepthSelectorCard } from './DepthSelectorCard';
import { GallonsHeroCard } from './GallonsHeroCard';
import { PlanCard } from './PlanCard';
import { PlantOptions } from './PlantOptions';
import styles from './ResultsScreen.module.scss';

export function ResultsScreen() {
  const flow = useFlow();
  const results = flow.results;
  const options = results?.sizing.options ?? [];

  // Default to the 6" option (middle), matching the design.
  const [selectedDepth, setSelectedDepth] = useState<number>(() => {
    if (options.some((o) => o.depth_in === 6)) return 6;
    return options[Math.min(1, Math.max(0, options.length - 1))]?.depth_in ?? 6;
  });
  const [confirmed, setConfirmed] = useState(false);

  if (!results || options.length === 0) return null;

  const selected = options.find((o) => o.depth_in === selectedDepth) ?? options[0];
  const notRecommended = !results.recommended;
  const gallons = results.gallons_per_year;

  const advisories = mergedAdvisories(
    results.advisories,
    results.sizing.advisories,
    selected.advisories,
  ).map((a) => ({ message: a.message, color: severityColor(a.severity) }));

  const plants = results.plants ?? { interior: [], perimeter: [] };

  return (
    <div className={styles.wrap}>
      <div className={gallons === null ? styles.topSingle : styles.topGrid}>
        <DepthSelectorCard
          options={options}
          selectedDepth={selectedDepth}
          confirmed={confirmed}
          onPick={setSelectedDepth}
          onConfirm={() => setConfirmed(true)}
        />
        {gallons !== null && <GallonsHeroCard gallons={gallons} confirmed={confirmed} />}
      </div>

      <PlanCard
        advisories={advisories}
        summary={selected.summary}
        notRecommended={notRecommended}
        onEdit={flow.returnToChat}
      />

      <PlantOptions
        interior={plants.interior}
        perimeter={plants.perimeter}
        reason={plants.reason}
        onReturnToChat={flow.returnToChat}
      />
    </div>
  );
}
