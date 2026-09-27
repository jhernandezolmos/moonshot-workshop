import type { CSSProperties, ReactNode } from "react";

export interface OverlayProps {
  beat: number;
  readable: boolean;
}

/** Index-based custom property for staggered CSS. */
export const idx = (i: number, extra: Record<string, string | number> = {}) =>
  ({ "--i": i, ...extra }) as CSSProperties;

export function Thread({ d, className = "", viewBox = "0 0 1000 600" }: { d: string; className?: string; viewBox?: string }) {
  return (
    <svg className={`thread ${className}`} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path className="thread__glow" d={d} pathLength={1} />
      <path className="thread__line" d={d} pathLength={1} />
    </svg>
  );
}

export function ConceptTag({ children = "Concept · fictional data" }: { children?: ReactNode }) {
  return <span className="concept-tag">{children}</span>;
}

export function Panel({ className = "", children, label }: { className?: string; children: ReactNode; label?: string }) {
  return (
    <div className={`panel ${className}`} aria-label={label} role={label ? "group" : undefined}>
      {children}
    </div>
  );
}
