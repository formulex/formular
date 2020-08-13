import { useRef } from 'react';

type ResultBox<T> = { v: T };

/**
 * React hook for creating a value exactly once. useMemo doesn't give this guarantee unfortunately
 * https://github.com/Andarist/use-constant
 */
export function useConstant<T>(fn: () => T): T {
  const ref = useRef<ResultBox<T>>();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
}
