import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_CHANGE_EVENT = "localStorageChange";

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
    } else {
      valueRef.current = null;
      setValue(null);
    }
  }, [key, parse]);

  useEffect(() => {
    if (!key) return;

    updateValueFromStorage();

    const onStorage = (event: StorageEvent | CustomEvent<{ key: string }>) => {
      const eventKey =
        event instanceof StorageEvent ? event.key : event.detail.key;

      if (eventKey === key) {
        updateValueFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_CHANGE_EVENT, onStorage as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        STORAGE_CHANGE_EVENT,
        onStorage as EventListener
      );
    };
  }, [key, updateValueFromStorage]);

  return [value, setValue, valueRef] as const;
}

export function triggerLocalStorageChange(key: string) {
  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGE_EVENT, {
      detail: { key },
    })
  );
}

export default useLocalStorageSubscription;
