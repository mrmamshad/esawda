'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { BlogPostForm, type BlogPostValues } from '../BlogPostForm';

function toFormData(v: BlogPostValues): FormData {
  const fd = new FormData();
  fd.append('title', v.title);
  fd.append('description', v.description);
  if (v.tags) fd.append('tags', v.tags);
  fd.append('status', v.status);
  if (v.imageFile) fd.append('image_file', v.imageFile);
  else if (v.imageUrl) fd.append('image', v.imageUrl);
  return fd;
}

export default function AdminBlogNewPage() {
  const router = useRouter();

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">New blog post</h1>
      </header>

      <div className="mt-4">
        <BlogPostForm
          submitLabel="Publish"
          onCancel={() => router.back()}
          onSubmit={async (v) => {
            await api('/admin/blogs', { method: 'POST', token: readToken(), body: toFormData(v) });
            router.push('/admin/blog' as Route);
          }}
        />
      </div>
    </>
  );
}
