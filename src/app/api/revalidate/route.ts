import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand ISR cache-buster for the marketplace home page.
 *
 * The homepage is statically generated with `export const revalidate = 120`
 * and its ad sections fetch through the Next.js fetch cache (also 120s).
 * When the Laravel admin approves / rejects / features / removes an ad,
 * the backend POSTs here with the shared secret so the stale HTML is
 * regenerated immediately instead of waiting out the ISR timer.
 *
 * Security: the shared secret must match `REVALIDATE_SECRET` (server-only
 * env var — never `NEXT_PUBLIC_`).
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ revalidated: false, error: 'REVALIDATE_SECRET not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({})) as { secret?: string };
  if (body.secret !== secret) {
    return NextResponse.json({ revalidated: false, error: 'Invalid secret.' }, { status: 401 });
  }

  // Regenerate the homepage route and purge every data-fetch tagged
  // "ads" (featured / urgent / last-24h / highlights / pre-owned).
  revalidatePath('/', 'layout');
  revalidateTag('ads');

  return NextResponse.json({ revalidated: true });
}
