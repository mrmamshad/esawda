import { HeaderSpacer } from '@/components/layout/Header';

/**
 * Homepage skeleton — shows during the server-data fetch window (before ISR
 * HTML hydrates on a cold cache). Light pulse blocks mirror the real layout
 * so the page doesn't paint a blank shell.
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-bg animate-pulse">
      <HeaderSpacer />
      {/* hero block */}
      <div className="h-[420px] bg-ink/5" />
      {/* section slots */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="container-page py-10">
          <div className="mb-6 h-8 w-1/3 rounded bg-ink/10" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="aspect-[3/4] rounded-xl bg-ink/10" />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}