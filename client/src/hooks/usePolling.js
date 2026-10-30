import { useEffect, useRef } from 'react';

// Tinatawag agad ang function pagka-mount, tapos inuulit kada `ms` milliseconds
// (kapalit ng dating loadX(); setInterval(loadX, ms)).
export default function usePolling(callback, ms) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    saved.current();
    if (!ms) return undefined;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
