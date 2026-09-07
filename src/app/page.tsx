import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Analytics Platform — frontend scaffold
      </h1>
      <p className="text-muted-foreground text-sm">
        Empty Next.js (App Router) project with Tailwind v4 + shadcn/ui. Feature modules
        live under <code className="font-mono">src/features/</code>.
      </p>
      <Button>Primary action</Button>
    </div>
  );
}
