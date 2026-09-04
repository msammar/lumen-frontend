import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Not found</h2>
      <p>That page or resource doesn&apos;t exist.</p>
      <Link href="/">Back to start</Link>
    </div>
  );
}
