import type * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-11 w-full rounded-[var(--radius-button)] border border-line bg-canvas px-3 py-2 text-base text-ink placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
}
