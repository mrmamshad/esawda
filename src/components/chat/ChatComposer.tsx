'use client';

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Textarea + image attach + send button. Enter sends, Shift+Enter newline.
 * Attached image → sent as an image message; text only otherwise.
 */
export function ChatComposer({
  onSend,
  disabled,
  placeholder = 'Type a message…',
}: {
  onSend: (body: string, image?: File | null) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const body = value.trim();
    if (!body && !image) return;
    setBusy(true);
    try {
      await onSend(body, image);
      setValue('');
      setImage(null);
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

  const attach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setImage(f);
    e.target.value = '';
  };

  return (
    <form onSubmit={submit} className="border-t border-line bg-white p-3">
      {image && (
        <div className="mb-2 flex items-center gap-2 rounded-field border border-line bg-surface-muted px-2.5 py-1.5 text-xs text-ink-muted">
          <ImageIcon size={14} />
          <span className="truncate">{image.name}</span>
          <button type="button" onClick={() => setImage(null)} className="ml-auto text-ink-faint hover:text-ink" aria-label="Remove image">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || busy}
          className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-field border border-line text-ink-muted transition hover:border-brand-500 hover:text-brand-700"
          aria-label="Attach image"
        >
          <ImageIcon size={17} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={attach} />
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={image ? 'Add a caption (optional)…' : placeholder}
          rows={1}
          disabled={disabled || busy}
          className="min-h-[44px] max-h-40 flex-1 resize-none rounded-field border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
        />
        <Button type="submit" variant="filled" size="md" disabled={disabled || busy || (!value.trim() && !image)} leftIcon={<Send size={16} />}>
          Send
        </Button>
      </div>
    </form>
  );
}
