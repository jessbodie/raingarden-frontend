import { Fragment } from 'react';
import { asset } from '@/lib/config';
import { PlanCtaButton } from './PlanCtaButton';
import { SeasonalCarousel } from './SeasonalCarousel';
import { CreditsDisclosure } from './CreditsDisclosure';
import styles from './LandingScreen.module.scss';

// Hero arrival animation ("Scattered", design_handoff_rain_hero). Delays are
// hand-authored and deliberately out of order — the scatter IS the rain metaphor,
// so don't "fix" them into a computed stagger. Durations live in the stylesheet.
type HeroWord = [text: string, delaySeconds: number];

const HERO_LINE_1: HeroWord[] = [
  ['A', 0.18],
  ['flood', 0.74],
  ['is', 0],
  ['made', 0.42],
  ['from', 1.02],
  ['millions', 0.28],
  ['of', 1.24],
  ['drops', 0.58],
  ['adding', 0.9],
  ['up.', 1.38],
];

const HERO_LINE_2: HeroWord[] = [
  ['Flood', 2.02],
  ['mitigation', 1.74],
  ['is', 2.58],
  ['built', 2.2],
  ['one', 2.94],
  ['garden', 1.86],
  ['at', 2.72],
  ['a', 2.36],
  ['time.', 2.84],
];

const HERO_LINE_3: HeroWord[] = [
  ['Give', 3.66],
  ['the', 4.14],
  ['rain', 3.5],
  ['somewhere', 4.38],
  ['to', 3.88],
  ['go.', 4.6],
];

// Real whitespace between spans (not flex/gap) so the line still wraps as text.
function ScatterWords({ words, className }: { words: HeroWord[]; className: string }) {
  return (
    <>
      {words.map(([text, delay], i) => (
        <Fragment key={`${text}-${i}`}>
          {i > 0 && ' '}
          <span className={className} style={{ animationDelay: `${delay}s` }}>
            {text}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function LandingScreen() {
  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div
          className={styles.heroPhoto}
          style={{ backgroundImage: `url('${asset('/rg_front_wet_crop_sm.jpg')}')` }}
        />
        <div className={styles.heroScrim} />
        <div className={styles.heroInner}>
          {/* Lines 1+2 collapse away together; the final line is a sibling outside. */}
          <div className={styles.heroCollapse}>
            <p className={styles.heroLine}>
              <ScatterWords words={HERO_LINE_1} className={styles.heroWord} />
            </p>
            <p className={`${styles.heroLine} ${styles.heroLine2}`}>
              <ScatterWords words={HERO_LINE_2} className={styles.heroWord} />
            </p>
          </div>
          <p className={styles.heroFinal}>
            <ScatterWords words={HERO_LINE_3} className={styles.heroWordFinal} />
          </p>
          <div className={styles.heroCta}>
            <PlanCtaButton />
          </div>
        </div>
      </div>

      <div className={styles.column}>
        {/* Explainer */}
        <div className={styles.explainer}>
          <p className={styles.explainerP}>
            A rain garden is a shallow dip in your yard, planted where the water already runs — it
            catches what pours off your roof and driveway before it races to the storm drain.
          </p>
          <h2 className={styles.explainerHeading}>What it does</h2>
          <ul className={styles.explainerList}>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>Your yard drinks it in instead of drowning.</span>
            </li>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>
                Roots and soil strain out oil, fertilizer, and grit before they reach the creek.
              </span>
            </li>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>Flowers throw a pollinator party.</span>
            </li>
          </ul>
          <p className={styles.explainerP}>
            When everything's paved, rain has nowhere to sink.  One rain garden soaks up thousands of
            gallons a year — a whole block of them is how a neighborhood stops flooding.
          </p>
        </div>

        <SeasonalCarousel />

        {/* How it works */}
        <div className={styles.how}>
          <h2 className={styles.eyebrow}>How it works</h2>
          <ol className={styles.steps}>
            <li>Enter your address — we pull your rainfall and growing conditions.</li>
            <li>Answer a few quick questions — soil, sun, space.</li>
            <li>Get your plan — how big, how deep, what to plant, done.</li>
          </ol>
          <p className={styles.howP}>
            A beginner-friendly, dig-it-yourself way to pitch in on stormwater.
          </p>
          <div className={styles.howCta}>
            <PlanCtaButton />
          </div>
        </div>

        {/* Full-bleed showcase */}
        <figure className={styles.showcase}>
          <div
            className={styles.showcaseImg}
            style={{ backgroundImage: `url('${asset('/rg_front_dry_crop_sm2.jpg')}')` }}
          />
        </figure>

        {/* About Me */}
        <div className={styles.about}>
          <div className={styles.aboutPortrait}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/jess_profile.png')} alt="Portrait of Jess" />
          </div>
          <div>
            <h2 className={styles.aboutHeading}>About Me</h2>
            <p className={styles.aboutBio}>
              I'm Jess — a home gardener who's put in two rain gardens of my own, one soggy season at a time. This advisor is what I built once I had the sizing math and plant logic dialed in: the same processes I use, turned into something anyone else with a yard and a downspout can run themselves.
            </p>
          </div>
        </div>

        <CreditsDisclosure />
      </div>
    </div>
  );
}
