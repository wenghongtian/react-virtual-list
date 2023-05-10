import { useRef } from "react";

export function useDebounceFn<T extends (...args: any[]) => void>(
  fn: T,
  options?: { wait: number }
) {
  const isRunningRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout>();

  const func = (...args: Parameters<T>) => {
    if (isRunningRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = setTimeout(() => {
        fn(...args);
        isRunningRef.current = false;
      }, options?.wait);
    }
    isRunningRef.current = true;
    timerIdRef.current = setTimeout(() => {
      fn(...args);
      isRunningRef.current = false;
    }, options?.wait);
  };
  const cancel = () => {
    clearTimeout(timerIdRef.current);
  };
  return { run: func, cancel };
}
