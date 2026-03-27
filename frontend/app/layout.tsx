import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alyra — Smart Energy Payments',
  description: 'Predictive energy access for Nigerian households. Buy tokens, track usage, prevent outages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}