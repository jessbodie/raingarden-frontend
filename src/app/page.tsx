import { FlowProvider } from '@/state/FlowContext';
import { AppShell } from '@/components/AppShell';
import { LandingScreen } from '@/components/landing/LandingScreen';

// JSON-LD for the landing route (real, indexable page).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Rain Garden Advisor',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'A free, beginner-friendly tool that designs a rain garden for your home — size, depth, and native plants — from your address and a few questions.',
    },
    {
      '@type': 'HowTo',
      name: 'How to plan a rain garden',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Enter your address',
          text: 'Enter your address — anywhere in the contiguous U.S. — and we pull your local rainfall and growing conditions.',
        },
        {
          '@type': 'HowToStep',
          name: 'Answer a few questions',
          text: 'Answer a few questions about your soil, sun, space, and water source.',
        },
        {
          '@type': 'HowToStep',
          name: 'Get your plan',
          text: 'Get your plan — size, depth, and plants for your rain garden.',
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FlowProvider>
        <AppShell landing={<LandingScreen />} />
      </FlowProvider>
    </>
  );
}
