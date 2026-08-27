import { useEffect, useRef, type DependencyList } from "react";

/**
 * Ejecuta `fn` cada `intervalMs` milisegundos y también de inmediato al montar
 * o cuando cambian las `deps`. Limpia el intervalo al desmontar.
 */
export function usePolling(
  intervalMs: number,
  fn: () => void | Promise<void>,
  deps: DependencyList = [],
): void {
  const savedFn = useRef(fn);
  savedFn.current = fn;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await savedFn.current();
    };
    void run();
    const id = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
