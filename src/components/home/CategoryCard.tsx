import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { Category } from '@/types/api';

/**
 * Category tile — Stitch homepage style. Aspect-square image with a
 * primary overlay that fades on hover; caption sits below in centred
 * headline-md typography.
 */
export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const href = (category.slug ? `/category/${category.slug}` : `/ads?filter[category]=${category.id}`) as Route;
  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-brand-50">
        {category.picture_url ? (
          <Image
            src={category.picture_url}
            alt={category.name}
            fill
            sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary text-4xl font-black">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className="text-center text-body-md font-semibold text-ink transition-colors group-hover:text-secondary">
        {category.name}
      </h3>
    </Link>
  );
}
