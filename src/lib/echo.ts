import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { env } from './env';

// laravel-echo 1.16+ exports Echo as a generic class. `Echo<any>` keeps the
// existing untyped call sites (window.Echo, getEcho) compiling without
// forcing a concrete broadcaster channel type everywhere.
type EchoInstance = Echo<any>;

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: EchoInstance | null;
  }
}

// Make Pusher available globally
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance: EchoInstance | null = null;

/**
 * Get or create Laravel Echo instance for WebSocket communication.
 * Connects to Laravel Reverb server for real-time messaging.
 */
export function getEcho(token?: string | null): EchoInstance | null {
  if (typeof window === 'undefined') return null;

  // Return existing instance if already created
  if (echoInstance) return echoInstance;

  // Require token for authenticated channels
  if (!token) return null;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
    wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
    wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Same origin as the API (…/api/v1 → …/broadcasting/auth). The old code
    // hardcoded 127.0.0.1:8001, so private-channel auth always failed in prod.
    authEndpoint: `${env.api.base.replace(/\/api\/v1\/?$/, '')}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  if (window) {
    window.Echo = echoInstance;
  }

  return echoInstance;
}

/**
 * Disconnect Echo and cleanup.
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    if (typeof window !== 'undefined') {
      window.Echo = null;
    }
  }
}
