/**
 * Temporary body for scaffolded routes so navigation in the shell resolves
 * instead of 404ing. Replace each usage with its real feature UI.
 */
export function PlaceholderPage({ title }: { title: string }) {
  const featureDir = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Scaffold route. The {title.toLowerCase()} feature will live under{' '}
        <code className="font-mono">src/features/{featureDir}/</code>.
      </p>
    </div>
  );
}
