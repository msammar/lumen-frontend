'use client';

import { config } from '@/lib/config';

// Push-based notifications (directive 3): WebSocket, server->client, per-user.
// Skeleton only — implement:
//  - auth on connect (token in first frame or query param), token refresh on the
//    long-lived connection
//  - reconnect with exponential backoff + jitter
//  - resume-after-disconnect: send last-seen event id, server replays the gap
//  - envelope: { id, type, ts, scope, payload }; dedupe by id on the client
type Listener = (event: unknown) => void;

export function createNotificationSocket() {
  let ws: WebSocket | null = null;
  const listeners = new Set<Listener>();

  function connect() {
    ws = new WebSocket(config.wsUrl);
    ws.onmessage = (m) => {
      const event = JSON.parse(m.data as string);
      listeners.forEach((l) => l(event));
    };
    // TODO: onclose -> backoff reconnect; onopen -> send auth + last-seen id
  }

  return {
    connect,
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    close() {
      ws?.close();
      ws = null;
    },
  };
}
