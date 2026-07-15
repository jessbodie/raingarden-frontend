import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.scss';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rain Garden Advisor',
  description:
    'A free, beginner-friendly tool that designs a rain garden for your home — size, depth, and native plants — from your address and a few questions.',
  applicationName: 'Rain Garden Advisor',
  authors: [{ name: 'Jess Bodie Richards' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Rain Garden Advisor',
    description:
      'Design a rain garden for your yard — size, depth, and native plants — from your address and a few questions.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
