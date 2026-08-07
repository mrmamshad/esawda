import { HeaderSpacer } from '@/components/layout/Header';

/**
 * Ad detail skeleton — shown while the /ads/{id} ISR page resolves on a cold
 * cache. Mirrors the 2-column layout: gallery/title column + seller card.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      <HeaderSpacer />
      <div className="container-page py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <div className="h-9 w-2/3 rounded bg-ink/10" />
            <div className="aspect-[4/3] w-full rounded-xl bg-ink/10" />
            <div className="h-5 w-1/2 rounded bg-ink/10" />
            <div className="h-5 w-3/4 rounded bg-ink/10" />
          </div>
          <div className="space-y-4">
            <div className="h-56 w-full rounded-xl bg-ink/10" />
            <div className="h-40 w-full rounded-xl bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}