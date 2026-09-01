/** @type {import('next').NextConfig} */
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Legacy image locations. `remotePatterns` beats the older domains list.
    remotePatterns: [
      { protocol: 'http',  hostname: '127.0.0.1', port: '8100', pathname: '/storage/**' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '8100', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8100', pathname: '/storage/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8100', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '8001', pathname: '/storage/**' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '8001', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8001', pathname: '/storage/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8001', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.eshauda.com',         pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.eshauda.com',         pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'api.esawda.com',        pathname: '/storage/**' },
      { protocol: 'https', hostname: 'api.esawda.com',        pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Next 15 keeps typedRoutes stable; enable for App-Router link safety.
    typedRoutes: true,
  },
  poweredByHeader: false,
  compress: true,

  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: '/backend-api/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },

  async headers() {
    const securityHeaders = [
      // Clickjacking / framing protection.
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // MIME-sniffing off — browsers honour the declared content type.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Referrer stays same-origin, downgrades to origin cross-origin.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // No camera/mic/geolocation for the whole site.
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // Mitigates stored XSS (see src/lib/sanitize.ts). Next inlines its own
      // bootstrap scripts, so script-src keeps 'unsafe-inline'/'unsafe-eval'
      // for the app shell; Google OAuth hosts are allow-listed for social login.
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https: http://127.0.0.1:8100 http://localhost:8100 http://127.0.0.1:8101 http://localhost:8101 http://127.0.0.1:8001 http://localhost:8001",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https: http://127.0.0.1:8100 http://localhost:8100 http://127.0.0.1:8101 http://localhost:8101 http://127.0.0.1:8001 http://localhost:8001 https://api.esawda.com https://*.eshauda.com",
          "frame-src 'self' https://accounts.google.com https://apis.google.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    // HSTS only when served over HTTPS (production). On plain-HTTP dev this
    // would force browsers into an upgrade loop for localhost.
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' });
    }

    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
