import type { Metadata } from 'next';
import { DownloadClient } from './DownloadClient';

export const metadata: Metadata = {
  title: 'Download your source code — eSawda',
  description: 'Enter your license key to download the eSawda source package.',
  robots: { index: false, follow: false },
};

export default function DownloadPage() {
  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-surface-muted to-white">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16">
        <DownloadClient />
      </div>
    </main>
  );
}
