'use client';

import { useState } from 'react';
import { Flag, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FavouriteButton } from './FavouriteButton';
import { ReportModal } from './ReportModal';
import { useAuthGate } from './AuthGate';

/**
 * Action strip shown under the Ad-Detail gallery: Save / Report / Share.
 * Kept as a client island so the surrounding page can stay a server component.
 */
export function AdActions({ adId, url, title }: { adId: number; url: string; title: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { requireLogin } = useAuthGate();

  const share = async () => {
    const absUrl = typeof window === 'undefined' ? url : `${window.location.origin}${url}`;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try { await navigator.share({ title, url: absUrl }); return; } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(absUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FavouriteButton adId={adId} variant="inline" />
      <Button variant="outline" size="md" leftIcon={<Flag size={16} />} onClick={() => requireLogin('report this product', () => setReportOpen(true))}>
        Report
      </Button>
      <Button variant="ghost" size="md" leftIcon={copied ? <Check size={16} /> : <Share2 size={16} />} onClick={share}>
        {copied ? 'Link copied' : 'Share'}
      </Button>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} adId={adId} />
    </div>
  );
}
