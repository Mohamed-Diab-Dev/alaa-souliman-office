import { statusMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";

const steps = [
  { id: "new", label: "وصل" },
  { id: "reviewing", label: "مراجعة" },
  { id: "in_progress", label: "تنفيذ" },
  { id: "resolved", label: "تم" },
] as const;

const panels: Record<string, string> = {
  amber: "bg-amber-50 text-amber-950 ring-amber-200",
  sky: "bg-sky-50 text-sky-950 ring-sky-200",
  violet: "bg-violet-50 text-violet-950 ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-950 ring-emerald-200",
  rose: "bg-rose-50 text-rose-950 ring-rose-200",
};

const dots: Record<string, string> = {
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

function stepIndex(status: string) {
  if (status === "rejected") return -1;
  const index = steps.findIndex((step) => step.id === status);
  return index === -1 ? 0 : index;
}

export function RequestStatus({ status }: { status: string }) {
  const meta = statusMeta(status);
  const current = stepIndex(status);

  return (
    <div className={cn("rounded-3xl p-5 ring-1", panels[meta.tone])}>
      <p className="text-sm font-bold">حالة الطلب</p>
      <div className="mt-2 flex items-center gap-3">
        <span className={cn("h-4 w-4 rounded-full", dots[meta.tone])} />
        <p className="text-2xl font-black">{meta.label}</p>
      </div>
      <p className="mt-3 text-lg leading-8">{meta.meaning}</p>

      {status === "rejected" ? null : (
        <ol className="mt-5 grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const done = index <= current;
            return (
              <li key={step.id} className="text-center">
                <span
                  className={cn(
                    "mx-auto mb-2 block h-3 rounded-full",
                    done ? dots[meta.tone] : "bg-black/10",
                  )}
                />
                <span className={cn("text-sm font-bold", done ? "" : "opacity-40")}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
