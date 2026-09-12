'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { BlogPostForm, type BlogPostInitial, type BlogPostValues } from '../../BlogPostForm';

export function EditBlogForm({ id, initial }: { id: number; initial: BlogPostInitial }) {
  const router = useRouter();

  const save = async (v: BlogPostValues) => {
    const fd = new FormData();
    // Multipart PUT: Laravel reads the override on POST.
    fd.append('_method', 'PUT');
    fd.append('title', v.title);
    fd.append('description', v.description);
    fd.append('tags', v.tags);
    fd.append('status', v.status);
    if (v.imageFile) fd.append('image_file', v.imageFile);
    else if (v.removeImage) fd.append('image', '');
    else fd.append('image', v.imageUrl);
    await api(`/admin/blogs/${id}`, { method: 'POST', token: readToken(), body: fd });
    router.push('/admin/blog' as Route);
    router.refresh();
  };

  return (
    <BlogPostForm
      initial={initial}
      submitLabel="Save changes"
      onCancel={() => router.back()}
      onSubmit={save}
    />
  );
}
