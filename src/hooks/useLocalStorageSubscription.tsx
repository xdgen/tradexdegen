import { useCallback, useEffect, useRef, useState } from "react";

function useLocalStorageSubscription<T>(
  key: string | null,
  parse?: (value: string) => T,
  defaultValue: T | null = null
) {
  const [value, setValue] = useState<T | null>(defaultValue);
  const valueRef = useRef<T | null>(defaultValue);

  const updateValueFromStorage = useCallback(() => {
    if (!key) return;

    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed = parse ? parse(stored) : (stored as unknown as T);
        valueRef.current = parsed;
        setValue(parsed);
      } catch {
        valueRef.current = null;
        setValue(null);
      }
    }
  }, [key, parse]);

  useEffect(() => {
    if (!key) return;

    updateValueFromStorage();

    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue) {
          try {
            const parsed = parse
              ? parse(event.newValue)
              : (event.newValue as unknown as T);
            valueRef.current = parsed;
            setValue(parsed);
          } catch {
            valueRef.current = null;
            setValue(null);
          }
        } else {
          valueRef.current = null;
          setValue(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, parse, updateValueFromStorage]);

  return [value, setValue, valueRef] as const;
}

export default useLocalStorageSubscription;
