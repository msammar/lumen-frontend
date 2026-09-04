import { createStore } from 'zustand/vanilla';

// High-frequency filter state kept OUT of React tree state to avoid cascading
// re-renders (front-end strategy: state management for high-frequency filter
// updates). Components subscribe to slices; the query/render layer reads a stable
// serialisable snapshot to build the (dataset + filter state + chart spec) hash.
//
// This is a store FACTORY, not a module-level singleton: a client component is
// still server-rendered on first load, so a singleton would be shared by every
// concurrent request in the Node process and leak one tenant's filters into
// another's SSR output. Instantiate once per request via FilterStoreProvider.
export interface FilterState {
  datasetId: string | null;
  predicates: Record<string, unknown>;
  setDataset: (id: string | null) => void;
  setPredicate: (column: string, value: unknown) => void;
  clear: () => void;
}

export type FilterStore = ReturnType<typeof createFilterStore>;

export const createFilterStore = (initial?: Partial<Pick<FilterState, 'datasetId'>>) =>
  createStore<FilterState>()((set) => ({
    datasetId: initial?.datasetId ?? null,
    predicates: {},
    setDataset: (datasetId) => set({ datasetId, predicates: {} }),
    setPredicate: (column, value) =>
      set((s) => ({ predicates: { ...s.predicates, [column]: value } })),
    clear: () => set({ predicates: {} }),
  }));
