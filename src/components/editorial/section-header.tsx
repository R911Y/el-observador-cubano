import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  href,
  linkLabel,
  id,
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 border-t-2 border-accent pt-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id={id}
          className="font-serif text-2xl font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="text-sm text-accent underline underline-offset-4 hover:text-accent-strong"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
