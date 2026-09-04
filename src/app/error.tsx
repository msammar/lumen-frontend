'use client';

import { useEffect } from 'react';

// Catches render/data errors in this segment's tree. Must be a client component.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to the observability pipeline (Sentry/OTel) with error.digest.
    console.error(error);
  }, [error]);

  return (
    <div role="alert" style={{ padding: '2rem' }}>
      <h2>Something went wrong</h2>
      <p>{error.message || 'Unexpected error.'}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
