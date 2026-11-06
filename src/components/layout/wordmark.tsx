import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex items-stretch gap-3", className)}
    >
      <span className="mt-0.5 block w-1 shrink-0 bg-accent" />
      <span className="flex flex-col">
        <span className="font-serif text-[1.55rem] font-semibold leading-none tracking-tight text-ink sm:text-[1.9rem]">
          El Observador
        </span>
        <span className="mt-1 font-serif text-[0.72rem] font-medium uppercase leading-none tracking-[0.42em] text-accent sm:text-[0.82rem]">
          Cubano
        </span>
      </span>
    </span>
  );
}
