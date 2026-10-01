'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { TestimonialForm, type TestimonialFormInitial, type TestimonialFormValues } from '../../TestimonialForm';

function toFormData(v: TestimonialFormValues): FormData {
  const fd = new FormData();
  fd.append('_method', 'PUT');
  fd.append('name', v.name);
  fd.append('designation', v.designation);
  fd.append('content', v.content);
  if (v.imageFile) fd.append('image_file', v.imageFile);
  else if (v.removeImage) fd.append('image', '');
  return fd;
}

export function EditTestimonialForm({ id, initial }: { id: number; initial: TestimonialFormInitial }) {
  const router = useRouter();

  return (
    <TestimonialForm
      initial={initial}
      submitLabel="Save changes"
      onCancel={() => router.back()}
      onSubmit={async (v) => {
        await api(`/admin/testimonials/${id}`, { method: 'POST', token: readToken(), body: toFormData(v) });
        router.push('/admin/testimonials' as Route);
      }}
    />
  );
}
