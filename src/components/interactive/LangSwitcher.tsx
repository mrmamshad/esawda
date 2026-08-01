'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'zh', label: '中文' },
];

const COOKIE = 'eshauda_lang';

export function LangSwitcher({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    if (m) setCurrent(decodeURIComponent(m[1]!));
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const set = (code: string) => {
    document.cookie = `${COOKIE}=${code}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setCurrent(code); setOpen(false);
    // Round-trip so server picks up the language.
    location.reload();
  };

  const active = LANGS.find((l) => l.code === current) ?? LANGS[0]!;
  const btnCls = onDark
    ? 'bg-white/10 text-white hover:bg-white/20'
    : 'bg-brand-50 text-brand-700 hover:bg-brand-100';

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 h-9 text-sm font-medium btn-focus transition', btnCls)}
      >
        <Globe size={14} />
        <span className="uppercase">{active.code}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-card border border-line bg-white shadow-popover">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => set(l.code)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50',
                l.code === current ? 'font-semibold text-brand-700' : 'text-ink',
              )}
            >
              <span>{l.label}</span>
              {l.code === current && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
