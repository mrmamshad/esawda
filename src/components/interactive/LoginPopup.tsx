'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import type { User } from '@/types/api';

/**
 * Bikroy-style login popup.
 *
 * Three view states:
 *   1. `pick`   — social buttons + language toggle + "E-mail or phone" CTA
 *   2. `email`  — inline email/phone + password form (no page nav)
 *   3. `signup` — inline register form
 *
 * The whole flow avoids a full-page redirect so the user stays exactly where
 * they were (mirroring bikroy.com's UX on ad detail pages).
 *
 * Social auth: we detect env-provided OAuth client ids and open the provider's
 * OAuth URL in a centered popup window; the backend is expected to expose
 * `/api/v1/auth/social/{provider}/callback` that returns `{ token, user }`
 * once wired. If the env id is missing we surface a clear notice instead of
 * silently failing.
 */
export type LoginPopupProps = {
  open:     boolean;
  onClose:  () => void;
  onSuccess?: (user: User, token: string) => void;
  /** Optional context — shown as a subtle "Sign in to <do X>" line. */
  reason?:  string;
};

type View = 'pick' | 'email' | 'signup';
type Lang = 'en' | 'bn';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function LoginPopup({ open, onClose, onSuccess, reason }: LoginPopupProps) {
  const [view,   setView]   = useState<View>('pick');
  const [lang,   setLang]   = useState<Lang>('en');
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Email/password form fields (view === 'email' | 'signup')
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [confirm,    setConfirm]    = useState('');

  // Lock scroll + wire escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Reset when reopened so a stale error doesn't leak between sessions.
  useEffect(() => {
    if (open) { setView('pick'); setError(null); setNotice(null); }
  }, [open]);

  if (!open) return null;
  const t = STRINGS[lang];

  const handleSuccess = (user: User, token: string) => {
    saveToken(token);
    onSuccess?.(user, token);
    onClose();
  };

  /** Opens a centered popup window for OAuth. */
  const openOAuthPopup = (url: string, provider: string) => {
    if (typeof window === 'undefined') return;
    const w = 500, h = 620;
    const y = window.top!.outerHeight / 2 + window.top!.screenY - h / 2;
    const x = window.top!.outerWidth  / 2 + window.top!.screenX - w / 2;
    const popup = window.open(
      url, `oauth-${provider}`,
      `toolbar=no,menubar=no,width=${w},height=${h},top=${y},left=${x}`,
    );
    if (!popup) { setError(t.popupBlocked); return; }

    // Listen for the callback message from our backend redirect page.
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { source?: string; token?: string; user?: User; error?: string };
      if (data?.source !== 'eshauda-oauth') return;
      window.removeEventListener('message', onMessage);
      popup.close();
      if (data.error) { setError(data.error); return; }
      if (data.token && data.user) handleSuccess(data.user, data.token);
    };
    window.addEventListener('message', onMessage);
  };

  const loginGoogle = () => {
    setError(null); setNotice(null);
    if (!GOOGLE_CLIENT_ID) {
      setNotice(t.googleMissing);
      return;
    }
    const redirect = encodeURIComponent(`${window.location.origin}/auth/oauth-callback`);
    const scope    = encodeURIComponent('openid email profile');
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${redirect}&response_type=token&scope=${scope}&prompt=select_account`;
    openOAuthPopup(url, 'google');
  };


  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body:   { identifier, password },
      });
      handleSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loginFailed);
    } finally { setBusy(false); }
  };

  const submitSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(t.pwMismatch); return; }
    setBusy(true); setError(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body:   { name, email: identifier, password, password_confirmation: confirm },
      });
      handleSuccess(data.user, data.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.signupFailed);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-surface-muted hover:text-ink"
        >
          <X size={16} />
        </button>

        <div className="p-8">
          {/* Language toggle (bikroy pattern) */}
          <div className="mx-auto grid w-full max-w-xs grid-cols-2 overflow-hidden rounded-md border border-line text-center text-sm">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`py-2 font-medium transition ${
                lang === 'en' ? 'bg-white text-brand-700 shadow-inner' : 'bg-surface-muted text-ink-muted'
              }`}
            >English</button>
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`py-2 font-medium transition ${
                lang === 'bn' ? 'bg-white text-brand-700 shadow-inner' : 'bg-surface-muted text-ink-muted'
              }`}
            >বাংলা</button>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {reason ? `${t.signInTo} ${reason}` : t.signInToReply}
          </p>

          {view === 'pick' && (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={loginGoogle}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white py-3 text-sm font-semibold text-ink shadow-sm hover:bg-surface-muted"
              >
                <GoogleGlyph />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => setView('email')}
                className="w-full rounded-md bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                {t.emailOrPhone}
              </button>

              <p className="pt-1 text-center text-sm text-ink-muted">
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  {t.registration}
                </button>
              </p>
            </div>
          )}

          {view === 'email' && (
            <form onSubmit={submitEmail} className="mt-4 space-y-3">
              <input
                required autoFocus
                placeholder={t.emailOrPhone}
                value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                className={INP}
              />
              <input
                required minLength={8} type="password"
                placeholder={t.password}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={INP}
              />
              <button
                type="submit" disabled={busy}
                className="w-full rounded-md bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
              >
                {busy ? t.signingIn : t.signIn}
              </button>
              <button
                type="button"
                onClick={() => setView('pick')}
                className="w-full text-center text-sm text-ink-muted hover:text-ink"
              >
                ← {t.backToOptions}
              </button>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={submitSignup} className="mt-4 space-y-3">
              <input
                required autoFocus
                placeholder={t.fullName}
                value={name} onChange={(e) => setName(e.target.value)}
                className={INP}
              />
              <input
                required type="email"
                placeholder={t.email}
                value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                className={INP}
              />
              <input
                required minLength={8} type="password"
                placeholder={t.password}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={INP}
              />
              <input
                required minLength={8} type="password"
                placeholder={t.confirmPassword}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={INP}
              />
              <button
                type="submit" disabled={busy}
                className="w-full rounded-md bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
              >
                {busy ? t.creating : t.createAccount}
              </button>
              <button
                type="button"
                onClick={() => setView('pick')}
                className="w-full text-center text-sm text-ink-muted hover:text-ink"
              >
                ← {t.backToOptions}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-center text-sm text-danger">{error}</div>
          )}
          {notice && (
            <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">{notice}</div>
          )}

          <p className="mt-6 text-center text-xs text-ink-muted">
            {t.byContinuing}{' '}
            <a href="/pages/terms" className="font-semibold text-brand-700 hover:underline">{t.policy}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

const INP =
  'h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

type StringKey =
  | 'signInToReply' | 'signInTo' | 'emailOrPhone' | 'email' | 'password'
  | 'confirmPassword' | 'fullName' | 'signIn' | 'signingIn' | 'createAccount'
  | 'creating' | 'backToOptions' | 'noAccount' | 'registration' | 'byContinuing'
  | 'policy' | 'loginFailed' | 'signupFailed' | 'pwMismatch'
  | 'googleMissing' | 'popupBlocked';

const STRINGS: Record<Lang, Record<StringKey, string>> = {
  en: {
    signInToReply:   'Sign in to reply',
    signInTo:        'Sign in to',
    emailOrPhone:    'E-mail or phone',
    email:           'E-mail',
    password:        'Password',
    confirmPassword: 'Confirm password',
    fullName:        'Full name',
    signIn:          'Sign in',
    signingIn:       'Signing in…',
    createAccount:   'Create account',
    creating:        'Creating…',
    backToOptions:   'Back to sign-in options',
    noAccount:       "Don't have an account?",
    registration:    'Registration',
    byContinuing:    'By continuing you agree to the',
    policy:          'Policy and Rules',
    loginFailed:     'Login failed. Please try again.',
    signupFailed:    'Registration failed. Please try again.',
    pwMismatch:      'Passwords do not match.',
    googleMissing:   'Google sign-in is being configured. Please use e-mail for now.',
    popupBlocked:    'Your browser blocked the sign-in popup — please allow it and try again.',
  },
  bn: {
    signInToReply:   'উত্তর দিতে সাইন ইন করুন',
    signInTo:        'সাইন ইন করুন —',
    emailOrPhone:    'ই-মেইল বা ফোন',
    email:           'ই-মেইল',
    password:        'পাসওয়ার্ড',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    fullName:        'পুরো নাম',
    signIn:          'সাইন ইন',
    signingIn:       'সাইন ইন হচ্ছে…',
    createAccount:   'অ্যাকাউন্ট তৈরি করুন',
    creating:        'তৈরি হচ্ছে…',
    backToOptions:   'সাইন-ইন অপশনে ফিরুন',
    noAccount:       'অ্যাকাউন্ট নেই?',
    registration:    'রেজিস্ট্রেশন',
    byContinuing:    'চালিয়ে যাওয়ার মাধ্যমে আপনি সম্মত হচ্ছেন',
    policy:          'নীতিমালা ও নিয়ম',
    loginFailed:     'সাইন-ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    signupFailed:    'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    pwMismatch:      'পাসওয়ার্ড মিলছে না।',
    googleMissing:   'Google সাইন-ইন কনফিগার হচ্ছে। এখন ই-মেইল ব্যবহার করুন।',
    popupBlocked:    'ব্রাউজার পপ-আপ ব্লক করেছে — অনুমতি দিন এবং আবার চেষ্টা করুন।',
  },
};

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-5.8C34.5 3.1 29.7 1 24 1 14.8 1 6.9 6.3 3.2 14l7 5.4C12 13.6 17.5 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.2 28.6c-.5-1.4-.7-2.9-.7-4.6s.2-3.2.7-4.6l-7-5.4C1.7 17.4 1 20.6 1 24s.7 6.6 2.2 10l7-5.4z" />
      <path fill="#34A853" d="M24 47c6.5 0 12-2.1 16-5.9l-7.4-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.5 0-12-4.1-13.8-9.9l-7 5.4C6.9 41.7 14.8 47 24 47z" />
    </svg>
  );
}

