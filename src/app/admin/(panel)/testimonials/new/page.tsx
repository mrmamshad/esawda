'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { TestimonialForm, type TestimonialFormValues } from '../TestimonialForm';

function toFormData(v: TestimonialFormValues): FormData {
  const fd = new FormData();
  fd.append('name', v.name);
  if (v.designation) fd.append('designation', v.designation);
  fd.append('content', v.content);
  if (v.imageFile) fd.append('image_file', v.imageFile);
  return fd;
}

export default function AdminTestimonialNewPage() {
  const router = useRouter();

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">New testimonial</h1>
      </header>

      <div className="mt-4">
        <TestimonialForm
          submitLabel="Add testimonial"
          onCancel={() => router.back()}
          onSubmit={async (v) => {
            await api('/admin/testimonials', { method: 'POST', token: readToken(), body: toFormData(v) });
            router.push('/admin/testimonials' as Route);
          }}
        />
      </div>
    </>
  );
}
