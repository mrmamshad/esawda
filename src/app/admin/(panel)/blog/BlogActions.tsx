'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function BlogActions({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const remove = async () => {
    if (!confirm('Delete this blog post?')) return;
    await api(`/admin/blogs/${id}`, { method: 'DELETE', token: readToken() });
    start(() => router.refresh());
  };

  return (
    <Button size="sm" variant="outline" onClick={remove} disabled={pending}>Delete</Button>
  );
}
