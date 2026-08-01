'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, X, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  BANGLADESH_DISTRICTS,
  groupDistrictsByLetter,
  TOTAL_ADS,
  type District,
  type Upazila,
} from '@/lib/bangladesh-districts';

const BRAND_RED = '#FF003F';

/**
 * Bikroy-style 2-level location picker.
 *
 * ┌───────────────────────┐          ┌───────────────────────┐
 * │  Level 1 · Districts  │─click──▶ │  Level 2 · Upazilas   │
 * │  Alphabetical grouped │          │  All <District> + list │
 * │  with ad counts       │◀─back────│  with ad counts        │
 * └───────────────────────┘          └───────────────────────┘
 *
 * On select at either level, `onSelect` fires with the chosen slug
 * (upazila overrides district) and the modal closes.
 */

export type LocationPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: { name: string; slug: string; parentName?: string }) => void;
  currentSlug?: string;
};

const fmt = (n: number) => n.toLocaleString('en-IN');

export function LocationPicker({ open, onClose, onSelect, currentSlug }: LocationPickerProps) {
  const [query, setQuery]     = useState('');
  const [drill, setDrill]     = useState<District | null>(null); // level 2 target

  // Reset every time the modal reopens so users don't land back on a
  // previously drilled-into district.
  useEffect(() => {
    if (open) { setQuery(''); setDrill(null); }
  }, [open]);

  // Escape closes + body scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (drill ? setDrill(null) : onClose());
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, drill, onClose]);

  /* ── Level 1: filtered district list ─────────────────────────────── */
  const filteredDistricts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);
  const districtGroups = useMemo(() => groupDistrictsByLetter(filteredDistricts), [filteredDistricts]);
  const districtLetters = Object.keys(districtGroups).sort();

  /* ── Level 2: upazilas of the drilled-into district ──────────────── */
  const filteredUpazilas = useMemo(() => {
    if (!drill) return [];
    const q = query.trim().toLowerCase();
    if (!q) return drill.upazilas;
    return drill.upazilas.filter((u) => u.name.toLowerCase().includes(q));
  }, [drill, query]);
  const upazilaGroups = useMemo(() => {
    const g: Record<string, Upazila[]> = {};
    for (const u of filteredUpazilas) {
      const l = (u.name[0] ?? '#').toUpperCase();
      (g[l] ??= []).push(u);
    }
    return g;
  }, [filteredUpazilas]);
  const upazilaLetters = Object.keys(upazilaGroups).sort();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={drill ? `Choose upazila in ${drill.name}` : 'Choose district'}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative flex max-h-[calc(100vh-80px)] w-full max-w-[960px] flex-col overflow-hidden rounded-[24px] bg-white p-8 shadow-[0_30px_80px_-20px_rgba(15,20,40,0.45)] ring-1 ring-line"
      >
        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {drill && (
              <button
                type="button"
                onClick={() => { setDrill(null); setQuery(''); }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-surface-muted"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <div>
              {!drill ? (
                <>
                  <p
                    className="text-[13px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: BRAND_RED }}
                  >
                    All Bangladesh · {fmt(TOTAL_ADS)} ads
                  </p>
                  <h2 className="mt-2 text-[22px] font-bold text-ink">Choose your district</h2>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {drill.name}
                  </p>
                  <h2 className="mt-2 text-[22px] font-bold text-ink">Choose an upazila</h2>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Search + top-level reset ────────────────────────────── */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-2 rounded-full border border-line bg-white px-4 focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-700">
            <Search size={16} className="text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={drill ? `Search in ${drill.name}…` : 'Find state, city or district…'}
              className="h-full w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </label>

          {!drill && (
            <button
              type="button"
              onClick={() => {
                onSelect({ name: 'All Bangladesh', slug: '' });
                onClose();
              }}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-[13px] font-semibold transition ${
                !currentSlug
                  ? 'border-transparent text-white'
                  : 'border-line bg-white text-ink hover:border-ink'
              }`}
              style={!currentSlug ? { backgroundColor: BRAND_RED } : undefined}
            >
              <MapPin size={14} />
              All Bangladesh
            </button>
          )}

          {drill && (
            <button
              type="button"
              onClick={() => {
                onSelect({ name: drill.name, slug: drill.slug });
                onClose();
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold text-white transition hover:brightness-95"
              style={{ backgroundColor: BRAND_RED }}
            >
              <MapPin size={14} />
              All {drill.name} · {fmt(drill.ads)}
            </button>
          )}
        </div>

        {/* ── Body list (level 1 or level 2) ──────────────────────── */}
        <div
          className="mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {!drill ? (
            districtLetters.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
                {districtLetters.map((letter) => (
                  <div key={letter} className="col-span-1 flex flex-col gap-1.5">
                    {(districtGroups[letter] ?? []).map((d, i) => (
                      <RowButton
                        key={d.slug}
                        letter={i === 0 ? letter : ''}
                        title={d.name}
                        meta={`${fmt(d.ads)} ads`}
                        chevron
                        active={d.slug === currentSlug}
                        onClick={() => setDrill(d)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )
          ) : upazilaLetters.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
              {upazilaLetters.map((letter) => (
                <div key={letter} className="col-span-1 flex flex-col gap-1.5">
                  {(upazilaGroups[letter] ?? []).map((u, i) => (
                    <RowButton
                      key={u.slug}
                      letter={i === 0 ? letter : ''}
                      title={u.name}
                      meta={`${fmt(u.ads)} ads`}
                      subtitle={drill.name}
                      active={u.slug === currentSlug}
                      onClick={() => {
                        onSelect({ name: u.name, slug: u.slug, parentName: drill.name });
                        onClose();
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Sub-components                                                      */
/* ────────────────────────────────────────────────────────────────── */

function RowButton({
  letter, title, meta, subtitle, active, chevron, onClick,
}: {
  letter: string;
  title: string;
  meta: string;
  subtitle?: string;
  active?: boolean;
  chevron?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition ${
        active ? 'text-white' : 'text-ink hover:bg-brand-50'
      }`}
      style={active ? { backgroundColor: BRAND_RED } : undefined}
    >
      <span className="flex items-start gap-3">
        <span
          className={`inline-flex h-6 w-4 shrink-0 items-center justify-center text-[11px] font-bold uppercase tracking-[0.1em] ${
            active ? 'text-white/70' : 'text-ink-faint'
          }`}
          aria-hidden
        >
          {letter}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-medium">
            {title}
            <span className={`ml-2 text-[13px] ${active ? 'text-white/85' : 'text-ink-muted'}`}>
              · {meta}
            </span>
          </span>
          {subtitle && (
            <span className={`mt-0.5 text-[12px] ${active ? 'text-white/70' : 'text-ink-faint'}`}>
              {subtitle}
            </span>
          )}
        </span>
      </span>
      {chevron && (
        <ChevronRight
          size={16}
          className={active ? 'mt-1 text-white/80' : 'mt-1 text-ink-faint group-hover:text-ink'}
        />
      )}
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-ink-muted">
      No matches for "{query}".
    </div>
  );
}
