'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Star, BadgeCheck, BadgeX, ExternalLink, ShoppingBag, ImageUp, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { User } from '@/types/api';

/**
 * Storefront hero at the top of the Shop Dashboard.
 *
 * Single cohesive block: banner image as the background, avatar overlay
 * at the bottom-left, shop name + meta, KPI strip in the header, and a
 * "View store" CTA top-right. Banner upload is inline (click the banner
 * image area) — no separate "Update banner" card stacked above.
 */
export function StoreHero({
  user, rating, reviewsCount, totalOrders, activeOrders, wishlistCount, viewsCount,
}: {
  user: User;
  rating: number;
  reviewsCount: number;
  totalOrders: number;
  activeOrders: number;
  wishlistCount?: number;
  viewsCount?: number;
}) {
  const shopName  = user.shop_name || user.name || user.username || 'My Shop';
  const ownerName = user.name || user.username;

  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(user.shop_banner_url ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();
  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    const fd = new FormData();
    fd.append('banner', file);
    try {
      const { data } = await api<{ user: User }>('/me/shop-banner', { method: 'POST', token: readToken(), body: fd });
      setUrl(data.user.shop_banner_url ?? null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Upload failed. Try a jpg/png/webp under 5MB.');
    } finally { setBusy(false); }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border"
      style={{
        background: 'var(--shp-surface)',
        borderColor: 'var(--shp-border)',
        boxShadow: 'var(--shp-shadow-sm)',
      }}
    >
      {/* ── Banner area ── */}
      <div className="group relative h-32 w-full overflow-hidden sm:h-40 md:h-44">
        {url ? (
          <Image src={url} alt="Shop banner" fill sizes="100vw" className="object-cover" unoptimized priority />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, #FFE7EC 0%, #FF003F 100%)',
            }}
          />
        )}
        {/* Subtle scrim so the avatar + buttons stay readable on any photo */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />

        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold backdrop-blur transition hover:bg-white active:translate-y-[1px] disabled:opacity-60"
          style={{ color: 'var(--shp-fg)' }}
        >
          <ImageUp size={13} /> {busy ? 'Uploading…' : url ? 'Change banner' : 'Upload banner'}
        </button>

        {err && (
          <p
            className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] backdrop-blur"
            style={{ color: 'var(--shp-danger)' }}
          >
            {err}
          </p>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>

      {/* ── Identity row ── */}
      <div className="relative px-5 pb-5 pt-0 sm:px-6 md:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div
              className="relative -mt-10 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-4 sm:-mt-12 sm:h-[88px] sm:w-[88px]"
              style={{
                background: 'var(--shp-surface)',
                borderColor: 'var(--shp-surface)',
                boxShadow: '0 10px 28px rgba(20, 15, 24, 0.18)',
              }}
            >
              {user.avatar_set ? (
                <Image src={user.avatar_url} alt={shopName} fill sizes="88px" className="object-cover" />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-2xl font-bold"
                  style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}
                >
                  {shopName.trim().charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="truncate text-xl font-bold tracking-tight md:text-[22px]"
                  style={{ color: 'var(--shp-fg)' }}
                >
                  {shopName}
                </h2>
                {user.shop_verified === true ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'var(--shp-success-soft)', color: 'var(--shp-success)' }}
                  >
                    <BadgeCheck size={11} /> Verified
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'var(--shp-warning-soft)', color: 'var(--shp-warning)' }}
                  >
                    <BadgeX size={11} /> Unverified
                  </span>
                )}
              </div>
              {ownerName && (
                <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--shp-fg-muted)' }}>
                  Owned by <span className="font-semibold" style={{ color: 'var(--shp-fg)' }}>{ownerName}</span>
                  <span className="mx-1.5" style={{ color: 'var(--shp-fg-faint)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--shp-fg-faint)' }}>@{user.username}</span>
                </p>
              )}
              <p
                className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px]"
                style={{ color: 'var(--shp-fg-muted)' }}
              >
                <Star size={13} className="fill-current" style={{ color: 'var(--shp-gold)' }} />
                <span className="font-semibold tabular-nums" style={{ color: 'var(--shp-fg)' }}>
                  {rating.toFixed(1)}
                </span>
                <span style={{ color: 'var(--shp-fg-faint)' }}>/ 5</span>
                {reviewsCount > 0 && (
                  <span style={{ color: 'var(--shp-fg-faint)' }}>· {reviewsCount} reviews</span>
                )}
              </p>
            </div>
          </div>

          <Link
            href={`/store/${user.username}` as Route}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition hover:bg-black/[0.025] lg:self-end"
            style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
          >
            View public store <ExternalLink size={13} />
          </Link>
        </div>

        {/* ── KPI strip ── */}
        <div
          className="mt-5 grid grid-cols-2 gap-1 overflow-hidden rounded-xl border sm:grid-cols-4"
          style={{ borderColor: 'var(--shp-border)', background: 'var(--shp-bg)' }}
        >
          <MiniStat label="Total orders"  value={totalOrders}   icon={<ShoppingBag size={14} />} tone="brand"   />
          <MiniStat label="Active orders" value={activeOrders}  icon={<ShoppingBag size={14} />} tone="accent"  />
          {typeof wishlistCount === 'number' && (
            <MiniStat label="Wishlisted"   value={wishlistCount} icon={<Heart size={14} />}       tone="info"    />
          )}
          {typeof viewsCount === 'number' && (
            <MiniStat label="Views (30d)"  value={viewsCount}    icon={<Eye size={14} />}         tone="success" />
          )}
        </div>
      </div>
    </motion.section>
  );
}

function MiniStat({
  label, value, icon, tone,
}: { label: string; value: number; icon: React.ReactNode; tone: 'brand' | 'accent' | 'info' | 'success' }) {
  const fg: Record<string, string> = {
    brand:   'var(--shp-brand)',
    accent:  'var(--shp-accent)',
    info:    'var(--shp-info)',
    success: 'var(--shp-success)',
  };
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5">
      <span
        className="grid h-8 w-8 place-items-center rounded-md"
        style={{ background: 'var(--shp-surface)', color: fg[tone] }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className="truncate text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--shp-fg-faint)' }}
        >
          {label}
        </p>
        <p
          className="text-[15px] font-bold tabular-nums leading-tight"
          style={{ color: 'var(--shp-fg)' }}
        >
          {new Intl.NumberFormat('en-IN').format(value)}
        </p>
      </div>
    </div>
  );
}
