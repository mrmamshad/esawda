'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Textarea + send button. Enter sends, Shift+Enter newline. Empty submits ignored.
 */
export function ChatComposer({
  onSend,
  disabled,
  placeholder = 'Type a message…',
}: {
  onSend: (body: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = value.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await onSend(body);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-white p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        rows={1}
        disabled={disabled || busy}
        className="min-h-[44px] max-h-40 flex-1 resize-none rounded-field border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
      />
      <Button type="submit" variant="filled" size="md" disabled={disabled || busy || !value.trim()} leftIcon={<Send size={16} />}>
        Send
      </Button>
    </form>
  );
}
