import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { cn } from '@/lib/cn';
import type { Blog } from '@/types/api';
import { CategoryChip } from './CategoryChip';
import { AuthorMeta } from './AuthorMeta';

export function BlogCard({ blog, className }: { blog: Blog; className?: string }) {
  const href = `/blog/${blog.url_slug}` as Route;
  const cat = blog.categories?.[0];
  return (
    <article className={cn('surface-card flex flex-col overflow-hidden', className)}>
      {/*
        Cover: the media itself is a link, but the CategoryChip lives as a
        sibling absolutely-positioned over the link. This avoids the invalid
        <a> inside <a> nesting (which caused a hydration mismatch).
      */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <Link href={href} className="block h-full w-full">
          {blog.image_url ? (
            <Image
              src={blog.image_url}
              alt={blog.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-50 text-brand-500 text-sm">No cover</div>
          )}
        </Link>
        {cat?.slug && (
          <div className="pointer-events-none absolute left-3 top-3">
            <span className="pointer-events-auto">
              <CategoryChip label={cat.title} href={`/blog/category/${cat.slug}`} tone="onDark" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={href} className="block text-lg font-bold text-ink line-clamp-2 hover:text-brand-700">
          {blog.title}
        </Link>
        <p className="line-clamp-2 text-sm text-ink-muted">{blog.excerpt}</p>
        <div className="mt-auto pt-2">
          <AuthorMeta author={blog.author} date={blog.created_at} linkAuthor={false} />
        </div>
      </div>
    </article>
  );
}
