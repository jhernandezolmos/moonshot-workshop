import { useEffect, useState } from "react";

/** Milliseconds left until `endsAt`, updated every half second while running. */
export function useCountdown(endsAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [endsAt]);
  return endsAt ? Math.max(0, endsAt - now) : 0;
}
