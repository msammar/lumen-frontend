'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import {
  createFilterStore,
  type FilterState,
  type FilterStore,
} from '@/features/filters/filterStore';

const FilterStoreContext = createContext<FilterStore | null>(null);

export function FilterStoreProvider({
  children,
  datasetId,
}: {
  children: ReactNode;
  datasetId?: string;
}) {
  // Lazy useState initializer: the store is created exactly once per component
  // instance (per request on the server) and is referentially stable. We never
  // call the setter, so this never triggers a re-render.
  const [store] = useState<FilterStore>(() =>
    createFilterStore(datasetId ? { datasetId } : undefined),
  );

  return (
    <FilterStoreContext.Provider value={store}>{children}</FilterStoreContext.Provider>
  );
}

export function useFilterStore<T>(selector: (state: FilterState) => T): T {
  const store = useContext(FilterStoreContext);
  if (!store) {
    throw new Error('useFilterStore must be used within a <FilterStoreProvider>');
  }
  return useStore(store, selector);
}
