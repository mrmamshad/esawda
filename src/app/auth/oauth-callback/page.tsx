'use client';

import { useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { User } from '@/types/api';

/**
 * OAuth landing route. The Google/Facebook popup redirects here with an
 * `access_token` fragment. We exchange that token with the backend, then
 * `postMessage` the resulting session back to the opener window (the login
 * popup) so it can close itself and complete the flow.
 */
export default function OAuthCallbackPage() {
  useEffect(() => {
    const parseFragment = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const q    = new URLSearchParams(hash || window.location.search);
      return {
        accessToken: q.get('access_token'),
        provider:    q.get('provider') ?? 'google',
        error:       q.get('error') ?? q.get('error_description'),
      };
    };

    (async () => {
      const { accessToken, provider, error } = parseFragment();
      const post = (payload: Record<string, unknown>) =>
        window.opener?.postMessage({ source: 'eshauda-oauth', ...payload }, window.location.origin);

      if (error)        { post({ error }); return; }
      if (!accessToken) { post({ error: 'Missing OAuth access token.' }); return; }

      try {
        const { data } = await api<{ user: User; token: string }>(
          `/auth/social/${provider}/callback`,
          { method: 'POST', body: { access_token: accessToken } },
        );
        // Remember the profile so the one-tap card can render on next visit.
        // Only track Google logins — Facebook one-tap isn't a first-class UX.
        try {
          if (provider === 'google') {
            localStorage.setItem('eshauda_google_hint', JSON.stringify({
              name:       data.user.name,
              email:      data.user.email,
              avatar_url: data.user.avatar_url,
            }));
          }
        } catch { /* private mode — non-fatal */ }
        post({ token: data.token, user: data.user });
      } catch (err) {
        post({ error: err instanceof ApiError ? err.message : 'OAuth exchange failed.' });
      }
    })();
  }, []);

  return (
    <div className="grid min-h-screen place-items-center p-6 text-center text-sm text-ink-muted">
      Completing sign-in…
    </div>
  );
}
