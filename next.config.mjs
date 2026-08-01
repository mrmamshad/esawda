/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Legacy image locations. `remotePatterns` beats the older domains list.
    remotePatterns: [
      { protocol: 'http',  hostname: '127.0.0.1', port: '8100', pathname: '/storage/**' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '8100', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8100', pathname: '/storage/**' },
      { protocol: 'http',  hostname: 'localhost', port: '8100', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.eshauda.com',         pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.eshauda.com',         pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Next 15 keeps typedRoutes stable; enable for App-Router link safety.
    typedRoutes: true,
  },
  poweredByHeader: false,
  compress: true,
};
export default nextConfig;
