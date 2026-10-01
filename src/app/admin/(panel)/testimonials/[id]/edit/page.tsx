import { notFound } from 'next/navigation';
import { apiFromServer } from '@/lib/api';
import { EditTestimonialForm } from './EditTestimonialForm';

export const dynamic = 'force-dynamic';

type AdminTestimonial = {
  id: number;
  name: string;
  designation?: string | null;
  content?: string | null;
  image?: string | null;
  image_url?: string | null;
};

export default async function AdminTestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: AdminTestimonial | null = null;
  try {
    const res = await apiFromServer<AdminTestimonial>(`/admin/testimonials/${id}`, { cache: 'no-store' });
    item = res.data ?? null;
  } catch {
    item = null;
  }
  if (!item) notFound();

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Edit testimonial #{item.id}</h1>
      </header>
      <div className="mt-4">
        <EditTestimonialForm
          id={item.id}
          initial={{
            name: item.name ?? '',
            designation: item.designation ?? '',
            content: item.content ?? '',
            image: item.image ?? null,
            image_url: item.image_url ?? null,
          }}
        />
      </div>
    </>
  );
}
