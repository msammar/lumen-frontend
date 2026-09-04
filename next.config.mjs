/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // DEV ONLY: route browser API calls through the same origin so auth
  // cookies/headers apply without CORS. In production this returns [] — terminate
  // /api at the ingress/CDN instead of putting the Node server in the analytical
  // query hot path (30 concurrent sessions x 10-20 queries/min).
  //
  // NOTE: rewrites never proxy WebSocket upgrades — the push channel connects
  // directly via NEXT_PUBLIC_WS_URL (see src/lib/config.ts).
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8080';
    return [{ source: '/api/:path*', destination: `${apiTarget}/api/:path*` }];
  },
};

export default nextConfig;
