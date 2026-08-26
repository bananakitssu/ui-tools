import { useState, useRef, useCallback } from 'react';

export interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
  active: boolean;
  exiting: boolean;
}

const ENTER_DURATION = 450;
const EXIT_DURATION = 300;

export function useRipple(disabled: boolean = false) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const nextId = useRef(0);
  const activeId = useRef<number | null>(null);
  const activatedAt = useRef<Map<number, number>>(new Map());
  const pendingEnd = useRef<Set<number>>(new Set());

  const scheduleExit = useCallback((id: number) => {
    const startedAt = activatedAt.current.get(id) ?? performance.now();
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(ENTER_DURATION - elapsed, 0);

    window.setTimeout(() => {
      setRipples((prev) => prev.map((r) => (r.id === id ? { ...r, exiting: true } : r)));
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
        activatedAt.current.delete(id);
      }, EXIT_DURATION);
    }, wait);
  }, []);

  const startRipple = useCallback(
    (x: number, y: number, size: number) => {
      if (disabled) return;
      const id = nextId.current++;
      activeId.current = id;
      setRipples((prev) => [...prev, { id, x, y, size, active: false, exiting: false }]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          activatedAt.current.set(id, performance.now());
          setRipples((prev) => prev.map((r) => (r.id === id ? { ...r, active: true } : r)));

          if (pendingEnd.current.has(id)) {
            pendingEnd.current.delete(id);
            scheduleExit(id);
          }
        });
      });
    },
    [disabled, scheduleExit]
  );

  const endRipple = useCallback(() => {
    const id = activeId.current;
    if (id === null) return;
    activeId.current = null;

    if (activatedAt.current.has(id)) {
      scheduleExit(id);
    } else {
      pendingEnd.current.add(id);
    }
  }, [scheduleExit]);

  return { ripples, startRipple, endRipple };
}
