// app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, Syne } from 'next/font/google';
import './globals.css';

// Configure fonts with Next.js optimization
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alyra — Energy Tokens for Nigeria',
  description: 'Buy prepaid electricity and solar energy tokens instantly.',
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmSans.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}