import { HeaderSpacer } from '@/components/layout/Header';

/**
 * Category listing skeleton — shared by /category/[cat] and
 * /category/[cat]/[subcat] (subtree). Shows a title bar + card grid while
 * the server resolves the ad list.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      <HeaderSpacer />
      <div className="container-page py-8">
        <div className="mb-8 h-8 w-1/3 rounded bg-ink/10" />
        <div className="h-px w-full bg-ink/5" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="aspect-[3/4] rounded-xl bg-ink/10" />
          ))}
        </div>
      </div>
    </div>
  );
}