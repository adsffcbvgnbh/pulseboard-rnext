"use client";

import { useCallback, useEffect, useState } from "react";

export function useSharedStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved !== null) {
      try { setValue(JSON.parse(saved) as T); } catch { /* use the fallback */ }
    } else setValue(fallback);
    const sync = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try { setValue(JSON.parse(event.newValue) as T); } catch { /* ignore corrupt data */ }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  const update = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (value: T) => T)(current) : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  return [value, update] as const;
}
