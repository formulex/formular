import { useEffect, useRef } from 'react';

export function useWhenValueChanges<V>(
  value: V,
  callback: () => void,
  isEqual: (a: V, b: V) => boolean = (a, b) => a === b
) {
  const previous = useRef(value);
  useEffect(() => {
    if (!isEqual(value, previous.current)) {
      callback();
      previous.current = value;
    }
  });
}
