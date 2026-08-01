import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import type { Blog } from '@/types/api';
import { CategoryChip } from './CategoryChip';
import { AuthorMeta } from './AuthorMeta';

export function BlogHero({ blog }: { blog: Blog }) {
  const href = `/blog/${blog.url_slug}` as Route;
  const cat = blog.categories?.[0];
  return (
    <Link href={href} className="surface-card relative block overflow-hidden">
      <div className="relative aspect-[16/6] w-full bg-brand-900">
        {blog.image_url && (
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            sizes="(min-width:1024px) 1024px, 100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8 text-white md:p-10 md:max-w-[60%]">
          {cat && <CategoryChip label={cat.title} tone="onDark" />}
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">{blog.title}</h2>
          <p className="line-clamp-2 text-sm text-white/85 md:text-base">{blog.excerpt}</p>
          <AuthorMeta author={blog.author} date={blog.created_at} onDark linkAuthor={false} />
        </div>
      </div>
    </Link>
  );
}
