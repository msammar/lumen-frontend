// Route-level fallback shown while a server component segment streams in.
// Per the architecture's "loading, skeleton, progressive" UX requirement, real
// segments should ship their own skeletons; this is the generic backstop.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" style={{ padding: '2rem' }}>
      Loading…
    </div>
  );
}
