'use client';

import { useState, type FormEvent } from 'react';
import { Download, KeyRound, PackageCheck, ShieldCheck, Loader2 } from 'lucide-react';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';

type Product = {
  product: string;
  version: string;
  size_mb: number | null;
  available: boolean;
  downloads_remaining: number;
  expires_in_minutes: number;
  download_url: string;
};

const field =
  'mt-1 h-12 w-full rounded-lg border border-line bg-white px-3 text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function DownloadClient() {
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${env.api.base}/download/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ key: key.trim(), email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? 'Could not validate your license.');
        return;
      }
      setProduct(json.data as Product);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success: show the product card + download button ──────────────────
  if (product) {
    return (
      <div className="w-full">
        <div className="surface-card overflow-hidden">
          <div className="bg-brand-700 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <PackageCheck size={26} />
              <div>
                <h1 className="text-lg font-bold">License verified</h1>
                <p className="text-sm text-white/80">Your download is ready.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Product" value={product.product} />
              <Info label="Version" value={`v${product.version}`} />
              <Info label="Size" value={product.size_mb ? `${product.size_mb} MB` : '—'} />
              <Info label="Downloads left" value={String(product.downloads_remaining)} />
            </dl>

            {product.available ? (
              <a href={product.download_url} className="block">
                <Button className="w-full justify-center" size="lg">
                  <Download size={18} /> Download package (.zip)
                </Button>
              </a>
            ) : (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The package is not available yet. Please contact support.
              </div>
            )}

            <p className="text-center text-xs text-ink-faint">
              This link expires in {product.expires_in_minutes} minutes. Each download counts against your quota.
            </p>

            <button
              onClick={() => { setProduct(null); setKey(''); setEmail(''); }}
              className="mx-auto block text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Use a different license
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Entry form ────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/20">
          <KeyRound size={26} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Download your source code</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter the license key and email from your purchase to get your package.
        </p>
      </div>

      <form onSubmit={submit} className="surface-card space-y-4 p-6">
        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <label className="block">
          <span className="text-sm font-medium text-ink">License key</span>
          <input
            value={key} onChange={(e) => setKey(e.target.value)}
            placeholder="ESW-XXXX-XXXX-XXXX"
            className={`${field} font-mono uppercase tracking-wide`}
            autoComplete="off" required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" className={field} required
          />
        </label>

        <Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : <>Verify &amp; continue</>}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <ShieldCheck size={13} /> Your license is validated securely.
        </p>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-muted px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
