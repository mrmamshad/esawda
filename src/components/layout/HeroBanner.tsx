import Image from 'next/image';
import { Breadcrumb, type Crumb } from '@/components/ui/Breadcrumb';
import { cn } from '@/lib/cn';

/**
 * Dark emerald hero banner used on the Browse page. Left half is title +
 * breadcrumb, right half is a collage of tilted product images. The
 * collage is a static decorative asset — pass an image array if you
 * want to swap it dynamically later.
 */
export function HeroBanner({
  title,
  crumbs,
  collage,
  className,
}: { title: string; crumbs: Crumb[]; collage?: string[]; className?: string }) {
  return (
    <section className={cn('relative overflow-hidden bg-brand-900 text-white px-8 py-14 md:px-12 md:py-16', className)}>
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <Breadcrumb items={crumbs} variant="onDark" className="mt-3" />
      </div>

      {collage && collage.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex">
          {collage.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className="relative -ml-4 h-56 w-40 overflow-hidden rounded-xl shadow-2xl ring-2 ring-white/10"
              style={{ transform: `translateY(${(i % 2 ? -1 : 1) * (i * 4)}px) rotate(${(i - 2) * 3}deg)` }}
            >
              <Image src={src} alt="" fill sizes="160px" className="object-cover" unoptimized={src.startsWith('/')} />
            </div>
          ))}
        </div>
      )}

      {/* Subtle radial gradient over the collage for depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/70 to-transparent" />
    </section>
  );
}
