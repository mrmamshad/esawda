import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight } from 'lucide-react';

/**
 * Shared Eris-style section header.
 *
 * A tiny orange "eyebrow" label sits above a chunky navy heading with
 * a single accent word coloured orange. On the right, a ghost "action"
 * pill mirrors the primary CTA style but sits quieter.
 *
 *   <SectionHeader
 *     eyebrow="Just posted"
 *     title={<>Fresh from sellers, <span className="text-brand-700">in 24h.</span></>}
 *     description="Newly listed items across every category."
 *     actionLabel="Browse all"
 *     actionHref="/ads"
 *   />
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  statPill,
  align = 'between',
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  actionLabel?: string;
  actionHref?: Route;
  statPill?: { label: string; tone?: 'success' | 'brand' };
  align?: 'between' | 'center';
}) {
  if (align === 'center') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-balance text-ink sm:text-4xl md:text-[48px] md:leading-[1.05]">{title}</h2>
        {description && <p className="mt-4 text-body-md text-ink-muted">{description}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          {statPill && (
            <span
              className={
                'inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ' +
                (statPill.tone === 'success'
                  ? 'bg-success/10 text-success'
                  : 'bg-brand-100 text-brand-800')
              }
            >
              {statPill.label}
            </span>
          )}
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-balance text-ink sm:text-4xl md:text-[48px] md:leading-[1.05]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-lg text-body-md text-ink-muted">{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="contents">
          <button className="group inline-flex items-center gap-2 rounded-pill border border-line bg-white pl-5 pr-2 py-2 text-body-md font-semibold text-ink transition hover:border-ink/40">
            {actionLabel}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white transition-transform group-hover:rotate-45">
              <ArrowUpRight size={14} />
            </span>
          </button>
        </Link>
      )}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
      <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
      {children}
    </p>
  );
}
