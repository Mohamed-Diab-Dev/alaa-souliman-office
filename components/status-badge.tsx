import { statusMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  amber: "bg-amber-100 text-amber-900 ring-amber-200",
  sky: "bg-sky-100 text-sky-900 ring-sky-200",
  violet: "bg-violet-100 text-violet-900 ring-violet-200",
  emerald: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  rose: "bg-rose-100 text-rose-900 ring-rose-200",
};

const dots: Record<string, string> = {
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1",
        tones[meta.tone],
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", dots[meta.tone])} />
      {meta.label}
    </span>
  );
}
