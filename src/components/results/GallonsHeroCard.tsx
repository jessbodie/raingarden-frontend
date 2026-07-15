import styles from './GallonsHeroCard.module.scss';

// gallons_per_year can be null — the caller hides this card entirely in that case.
export function GallonsHeroCard({
  gallons,
  confirmed,
}: {
  gallons: number;
  confirmed: boolean;
}) {
  const title = confirmed
    ? 'Stormwater Diverted and Filtered'
    : 'Your rain garden will divert and filter this many gallons of storm water annually:';
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.statRow}>
        <span className={styles.stat}>{gallons.toLocaleString()}</span>
        <span className={styles.unit}>gallons/year</span>
      </div>
    </div>
  );
}
