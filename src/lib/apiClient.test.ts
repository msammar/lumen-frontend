import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from '@/lib/apiClient';

function mockFetch(response: Response) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('defaults Content-Type to JSON for a string body', async () => {
    const spy = mockFetch(new Response('{}', { status: 200 }));
    await apiFetch('/x', { method: 'POST', body: JSON.stringify({ a: 1 }) });

    const headers = (spy.mock.calls[0]![1] as RequestInit).headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('never sets Content-Type for FormData (browser adds the boundary)', async () => {
    const spy = mockFetch(new Response('{}', { status: 200 }));
    await apiFetch('/upload', { method: 'POST', body: new FormData() });

    const headers = (spy.mock.calls[0]![1] as RequestInit).headers as Headers;
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('preserves caller headers passed as a Headers instance', async () => {
    const spy = mockFetch(new Response('{}', { status: 200 }));
    await apiFetch('/x', { headers: new Headers({ Authorization: 'Bearer t' }) });

    const headers = (spy.mock.calls[0]![1] as RequestInit).headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer t');
  });

  it('throws ApiError carrying status and parsed body on non-2xx', async () => {
    mockFetch(
      new Response(JSON.stringify({ message: 'bad field' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiFetch('/x')).rejects.toMatchObject({
      constructor: ApiError,
      status: 422,
      body: { message: 'bad field' },
    });
  });

  it('returns undefined for a 204 response', async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(apiFetch('/x')).resolves.toBeUndefined();
  });
});
