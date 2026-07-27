'use client';

import { useState } from 'react';
import styles from './CreditsDisclosure.module.scss';

type Source = {
  publisher: string;
  title: string;
  href?: string; // omitted → rendered as plain text (link pending)
  note?: string; // trailing detail, e.g. a page reference or dataset citation
  secondary?: { label: string; href: string }; // optional extra link
};

// APIs and datasets the deployed app calls at runtime.
const API_SOURCES: Source[] = [
  {
    publisher: 'USDA, NRCS',
    title: 'The PLANTS Database',
    href: 'https://plants.usda.gov',
    note: 'National Plant Data Team, Greensboro, NC.',
    secondary: {
      label: 'PLANTS Help Document (PDF)',
      href: 'https://plants.usda.gov/assets/docs/PLANTS_Help_Document.pdf',
    },
  },
  {
    publisher: 'USDA',
    title: 'Plant Hardiness Zone Map',
    href: 'https://planthardiness.ars.usda.gov/',
  },
  {
    publisher: 'Open-Meteo',
    title: 'Weather data',
    href: 'https://open-meteo.com/',
  },
  {
    publisher: 'OpenStreetMap',
    title: 'Nominatim geocoding — © OpenStreetMap contributors (ODbL)',
    href: 'http://osm.org/copyright',
  },
  {
    // Link pending — repo only exposes the API endpoint, not a citation page.
    publisher: 'Google',
    title: 'Solar API (roof-area estimate)',
  },
  {
    // Link pending — repo only exposes the API endpoint, not a citation page.
    publisher: 'RapidAPI',
    title: 'USDA Plant Hardiness Zones API (access layer for the USDA zone data)',
  },
];

// Written guidance and background reading (primary + secondary sources).
const GUIDANCE_SOURCES: Source[] = [
  {
    publisher: 'Washington, D.C. Department of Energy & Environment',
    title: 'Rain Garden: A How-To Manual for Homeowners',
    href: 'https://doee.dc.gov/sites/default/files/dc/sites/ddoe/publication/attachments/RaingardenHow2HomeownerUWExtension.pdf',
    note: 'Source of the rain-garden size factors (page 9); adapting UW-Extension.',
  },
  {
    publisher: 'Five Counties Salmonid Conservation Program',
    title: 'Build a Rain Garden',
    href: 'https://www.5counties.org/docs/lu_planning/04_rain_garden.pdf',
  },
  {
    publisher: 'U.S. EPA',
    title: "Soak Up the Rain: What's the Problem",
    href: 'https://www.epa.gov/soakuptherain/soak-rain-whats-problem',
  },
  {
    publisher: 'Oregon Sea Grant',
    title: 'Oregon Rain Garden Guide',
    href: 'https://seagrant.oregonstate.edu/sites/seagrant.oregonstate.edu/files/h10001-lo.pdf',
  },
  {
    publisher: 'Inch Calculator',
    title: 'Cubic Inch to Gallon conversion',
    href: 'https://www.inchcalculator.com/convert/cubic-inch-to-gallon/',
  },
  {
    publisher: 'University of Arizona Cooperative Extension, Water Wise',
    title: 'Harvest Rain',
    href: 'https://waterwise.arizona.edu/ways-save-water/harvest-rain',
  },
  {
    publisher: 'Missouri Botanical Garden',
    title: 'Rainscaping Guide',
    href: 'https://www.missouribotanicalgarden.org/sustainability/sustainability/sustainable-solutions-for-you/rainscaping-guide/design-and-build-a-rain-garden/determine-rain-garden-size-and-depth',
  },
  {
    publisher: 'Beckley Sanitary Board',
    title: 'Build Your Own Rain Garden',
    href: 'https://beckleysanitaryboard.org/build-your-own-rain-garden/',
  },
  {
    publisher: 'Alabama A&M Extension',
    title: 'Determine the Size and Depth of the Rain Garden',
    href: 'https://www.aces.edu/blog/topics/fish-water/step-4-determine-the-size-and-depth-of-the-rain-garden/',
  },
  {
    publisher: 'The New York Times',
    title: "NYC's aging sewer system and flooding",
    href: 'https://www.nytimes.com/2023/09/29/nyregion/nyc-sewer-system-infrastructure.html',
  },
];

// AI/tool build colophon — how the project was made, not where its data came from.
const BUILT_WITH: Source[] = [
  { publisher: 'Claude Chat', title: 'planning, notebook port, and architecture' },
  { publisher: 'Claude Code', title: 'backend, agent loop, and tests' },
  { publisher: 'Claude Design', title: 'visual system and UI' },
  { publisher: 'Recraft', title: 'logo and brand mark' },
];

const BUILT_WITH_STORY = 'https://github.com/jessbodie/rain-garden-advisor#how-ai-was-used';

function SourceItem({ source }: { source: Source }) {
  return (
    <li className={styles.item}>
      <span className={styles.bullet}>■</span>
      <span className={styles.entry}>
        <span className={styles.publisher}>{source.publisher}</span>
        {' — '}
        {source.href ? (
          <a className={styles.link} href={source.href} target="_blank" rel="noopener noreferrer">
            {source.title}
          </a>
        ) : (
          <span className={styles.title}>{source.title}</span>
        )}
        {source.note ? <span className={styles.note}> {source.note}</span> : null}
        {source.secondary ? (
          <>
            {' '}
            <a
              className={styles.link}
              href={source.secondary.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.secondary.label}
            </a>
          </>
        ) : null}
      </span>
    </li>
  );
}

export function CreditsDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.chevron} style={{ transform: `rotate(${open ? 90 : 0}deg)` }}>
          ›
        </span>
        <span className={styles.heading}>Credits &amp; Sources</span>
      </button>
      {open && (
        <div className={styles.body}>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>APIs &amp; Data</h3>
            <ul className={styles.list}>
              {API_SOURCES.map((s) => (
                <SourceItem key={s.publisher + s.title} source={s} />
              ))}
            </ul>
          </section>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>Guidance &amp; Reading</h3>
            <ul className={styles.list}>
              {GUIDANCE_SOURCES.map((s) => (
                <SourceItem key={s.publisher + s.title} source={s} />
              ))}
            </ul>
          </section>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>Tools</h3>
            <ul className={styles.list}>
              {BUILT_WITH.map((s) => (
                <SourceItem key={s.publisher + s.title} source={s} />
              ))}
            </ul>
            <p className={styles.groupNote}>
              <a
                className={styles.link}
                href={BUILT_WITH_STORY}
                target="_blank"
                rel="noopener noreferrer"
              >
                How AI was used →
              </a>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
