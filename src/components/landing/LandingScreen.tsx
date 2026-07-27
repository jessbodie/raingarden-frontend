import { asset } from '@/lib/config';
import { PlanCtaButton } from './PlanCtaButton';
import { SeasonalCarousel } from './SeasonalCarousel';
import { CreditsDisclosure } from './CreditsDisclosure';
import styles from './LandingScreen.module.scss';

export function LandingScreen() {
  return (
    <div>
      {/* Hero */}
      <div
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(55,34,72,.72) 0%, rgba(65,71,112,.68) 100%), url('${asset('/rg_front_wet_crop_sm.jpg')}')`,
        }}
      >
        <div className={styles.heroHatch} />
        <div className={styles.heroInner}>
          <p className={`${styles.heroLine} rga-fu`}>
            A flood is made from millions of drops adding up
          </p>
          <p className={`${styles.heroLine} rga-fu2`}>
            Flood mitigation is built one garden at a time.
          </p>
          <p className={`${styles.heroLine} ${styles.heroLineLast} rga-fu3`}>
            Give the rain somewhere to go.
          </p>
          <PlanCtaButton />
        </div>
      </div>

      <div className={styles.column}>
        {/* Explainer */}
        <div className={styles.explainer}>
          <p className={styles.explainerP}>
            A rain garden is a shallow, planted dip in your yard, set where runoff already flows.
            It catches the water sheeting off your roof and driveway — your share of what would
            otherwise rush to the storm drain.
          </p>
          <ul className={styles.explainerList}>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>
                <strong>Soak, don&apos;t flood.</strong> It sinks in slowly instead of overwhelming
                the sewer.
              </span>
            </li>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>
                <strong>Filter the bad stuff.</strong> Soil and deep roots trap oil, fertilizer,
                and grit before they reach our creeks and rivers.
              </span>
            </li>
            <li className={styles.explainerItem}>
              <span className={styles.explainerBullet}>■</span>
              <span>
                <strong>Habitat, too.</strong> Flowering plants bring in pollinators.
              </span>
            </li>
          </ul>
          <p className={styles.explainerP}>
            Small effort, real math: one modest garden can divert thousands of gallons a year.
            Multiply that by a block.
          </p>
        </div>

        <SeasonalCarousel />

        {/* How it works */}
        <div className={styles.how}>
          <h2 className={styles.eyebrow}>How it works</h2>
          <ol className={styles.steps}>
            <li>
              Enter your address — anywhere in the contiguous U.S. — and we pull your local
              rainfall and growing conditions.
            </li>
            <li>Answer a few questions — soil, sun, space, water source.</li>
            <li>Get your plan — size, depth, and plants for your rain garden.</li>
          </ol>
          <p className={styles.howP}>
            If you&apos;ve got a patch of yard, a downspout or two, and a free weekend in you — this
            is for you. No landscaping experience required. This is a beginner-friendly,
            dig-it-yourself way to pitch in on storm water management.
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
