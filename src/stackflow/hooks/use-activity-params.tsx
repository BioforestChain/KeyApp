import { createContext, useContext, type ReactNode } from "react";

// Context for passing Activity params to child components
const ActivityParamsContext = createContext<Record<string, unknown>>({});

export function ActivityParamsProvider({
  params,
  children,
}: {
  params: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <ActivityParamsContext.Provider value={params}>
      {children}
    </ActivityParamsContext.Provider>
  );
}

/**
 * Get Activity params in child components
 * Replaces useParams() and useSearch() from TanStack Router
 */
export function useActivityParams<T extends Record<string, unknown> = Record<string, unknown>>(): T {
  return useContext(ActivityParamsContext) as T;
}
