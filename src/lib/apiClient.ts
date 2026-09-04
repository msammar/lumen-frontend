import { config } from '@/lib/config';

/** Thrown for any non-2xx response. Carries the parsed body so callers can
 *  discriminate 401 (refresh) from 422 (show field errors) from 5xx (retry). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Thin fetch wrapper for the read-path API. Result sets in, no client-side crunching.
 *
 * TODO: attach auth token + 401 refresh once auth lands.
 * Pass `init.signal` (AbortController) to cancel superseded filter requests —
 * request cancellation is critical per the compute strategy.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  // Never set Content-Type for FormData — the browser must add the multipart
  // boundary itself. Only default it for JSON-ish bodies.
  const hasBody = init?.body != null;
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    credentials: 'include', // cookie auth survives a cross-origin API base
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, body, `API ${res.status} ${detail} for ${path}`);
  }

  if (res.status === 204 || res.headers.get('Content-Length') === '0') {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
