import type * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  as: Component = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: "div" | "header" | "main" | "footer" | "section" }) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-[80rem] px-4 sm:px-6", className)}
      {...props}
    />
  );
}
