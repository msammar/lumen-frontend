'use client';

import { useEffect } from 'react';

// Last-resort boundary: catches errors thrown in the root layout itself.
// Replaces <html>/<body>, so it must render them.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div role="alert" style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Application error</h2>
          <button type="button" onClick={reset}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
