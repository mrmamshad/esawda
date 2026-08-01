'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastKind = 'success' | 'danger' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

const Ctx = createContext<{ notify: (kind: ToastKind, message: string) => void } | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be inside <ToastProvider>');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const notify = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
        {items.map((t) => <ToastItem key={t.id} toast={t} onClose={() => setItems((p) => p.filter((x) => x.id !== t.id))} />)}
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {}, []);
  const tone =
    toast.kind === 'success' ? 'border-brand-500 text-brand-800' :
    toast.kind === 'danger'  ? 'border-danger text-ink' :
                               'border-brand-500 text-ink';
  const Icon = toast.kind === 'danger' ? AlertCircle : CheckCircle2;
  const iconTone = toast.kind === 'danger' ? 'text-danger' : 'text-brand-500';
  return (
    <div className={cn('pointer-events-auto surface-card flex items-start gap-3 border-l-4 p-3 shadow-popover', tone)}>
      <Icon size={18} className={cn('mt-0.5 shrink-0', iconTone)} />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}
