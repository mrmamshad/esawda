import { notFound } from 'next/navigation';
import { apiFromServer } from '@/lib/api';
import { EditBlogForm } from './EditBlogForm';

export const dynamic = 'force-dynamic';

type AdminBlog = {
  id: number;
  title: string;
  description?: string | null;
  tags?: string | null;
  status?: string | null;
  image?: string | null;
};

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let blog: AdminBlog | null = null;
  try {
    const res = await apiFromServer<AdminBlog>(`/admin/blogs/${id}`, { cache: 'no-store' });
    blog = res.data ?? null;
  } catch {
    blog = null;
  }
  if (!blog) notFound();

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Edit blog post #{blog.id}</h1>
      </header>
      <div className="mt-4">
        <EditBlogForm
          id={blog.id}
          initial={{
            title: blog.title ?? '',
            description: blog.description ?? '',
            tags: blog.tags ?? '',
            status: blog.status ?? 'publish',
            image: blog.image ?? null,
          }}
        />
      </div>
    </>
  );
}
