// Runtime env validation. NEXT_PUBLIC_* values are inlined at build time, so this
// runs both at build and in the browser bundle. A missing var must FAIL LOUDLY
// rather than silently fall back to a localhost default that ships to production.
//
// Kept dependency-free on purpose (empty scaffold). Swap for `@t3-oss/env-nextjs`
// + zod once the surface grows.

type EnvSpec = {
  /** Fallback used ONLY in development. In production a missing value throws. */
  devDefault?: string;
  /** Extra shape check; return an error string to reject. */
  validate?: (value: string) => string | undefined;
};

const isProd = process.env.NODE_ENV === 'production';

function read(name: string, spec: EnvSpec): string {
  // Must reference process.env.<LITERAL> so Next can statically inline it.
  const raw = rawEnv[name];
  const value = raw ?? (isProd ? undefined : spec.devDefault);

  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Set it in .env.local (see .env.example).`,
    );
  }

  const problem = spec.validate?.(value);
  if (problem) {
    throw new Error(`Invalid environment variable ${name}: ${problem} (got "${value}")`);
  }

  return value;
}

// Explicit literal map — do NOT convert to dynamic access, it defeats inlining.
const rawEnv: Record<string, string | undefined> = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
};

const startsWith =
  (...prefixes: string[]) =>
  (value: string) =>
    prefixes.some((p) => value.startsWith(p))
      ? undefined
      : `expected one of ${prefixes.map((p) => `"${p}"`).join(', ')}`;

export const env = {
  NEXT_PUBLIC_API_BASE_URL: read('NEXT_PUBLIC_API_BASE_URL', {
    devDefault: '/api',
    validate: startsWith('/', 'http://', 'https://'),
  }),
  NEXT_PUBLIC_WS_URL: read('NEXT_PUBLIC_WS_URL', {
    devDefault: 'ws://localhost:8080/ws',
    validate: startsWith('ws://', 'wss://'),
  }),
} as const;
