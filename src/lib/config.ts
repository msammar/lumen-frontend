import { env } from '@/lib/env';

// Centralised runtime config, derived from validated env (see lib/env.ts).
export const config = {
  apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  wsUrl: env.NEXT_PUBLIC_WS_URL,
} as const;
