// Shared between the server layout (which reads the cookie so the shell is
// rendered with the right width on first paint) and the client shell (which
// writes it). Kept free of 'use client' so the server can import it.
export const SIDEBAR_COOKIE = 'sidebar:collapsed';

export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseCollapsedCookie(value: string | undefined) {
  return value === 'true';
}
