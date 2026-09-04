import { QueryClient } from '@tanstack/react-query';

// Server owns all computation (directive 1); the client just caches result sets.
// Defaults tuned for a chatty, filter-driven UI: short staleness, no refetch storms.
// Factory (not a singleton) so the App Router never shares cache across requests.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
