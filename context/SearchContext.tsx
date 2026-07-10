import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  clearSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState('');

  const setQuery = useCallback((value: string) => setQueryState(value), []);
  const clearSearch = useCallback(() => setQueryState(''), []);

  const value = useMemo(
    () => ({ query, setQuery, clearSearch }),
    [query, setQuery, clearSearch],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
