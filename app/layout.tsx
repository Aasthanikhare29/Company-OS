import type { Metadata } from 'next';
import '@fontsource-variable/public-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Company OS | Central Admin',
  description: 'One connected workspace for your entire business. Interactive central admin UI prototype.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
