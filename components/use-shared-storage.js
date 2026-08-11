"use client";

import { useCallback, useEffect, useState } from "react";

export function useSharedStorage(key, fallback) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved !== null) {
      try { setValue(JSON.parse(saved)); } catch { /* use the fallback */ }
    } else setValue(fallback);
    const sync = (event) => {
      if (event.key === key && event.newValue !== null) {
        try { setValue(JSON.parse(event.newValue)); } catch { /* ignore corrupt data */ }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  const update = useCallback((next) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  return [value, update];
}
