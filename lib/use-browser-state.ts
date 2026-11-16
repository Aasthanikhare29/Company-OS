'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export function useBrowserState<T>(key: string, initial: T | (() => T), valid: (value: unknown) => boolean): [T, Dispatch<SetStateAction<T>>, string] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');
  const validator = useRef(valid);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.version === 1 && validator.current(data.value)) setValue(data.value as T);
        else setWarning('Stored demo data was invalid; sample data was restored.');
      }
    } catch { setWarning('Browser storage is unavailable or unreadable. Changes may last only for this session.'); }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify({ version: 1, value })); }
    catch { setWarning('Browser storage is unavailable or full. Changes last only for this session.'); }
  }, [key, value, ready]);
  return [value, setValue, warning];
}
