import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 p-6 sm:p-8",
        className,
      )}
    >
      <p className="font-serif text-xl font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
