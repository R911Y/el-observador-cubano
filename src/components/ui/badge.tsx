import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "accent" | "draft";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface text-ink",
  accent: "border-accent bg-accent text-on-accent",
  draft: "border-accent/40 bg-transparent text-accent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
