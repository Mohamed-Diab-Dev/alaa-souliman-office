"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, FileText, HelpCircle, ShieldAlert, Wallet } from "lucide-react";
import { createRequest } from "@/app/actions/requests";
import { VoiceRecorder } from "@/components/voice-recorder";
import { REQUEST_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  support: Wallet,
  complaint: ShieldAlert,
  papers: FileText,
  job: Briefcase,
  other: HelpCircle,
};

export function RequestComposer() {
  const router = useRouter();
  const [category, setCategory] = useState("support");
  const [voice, setVoice] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    if (voice) formData.set("voice", voice);
    setPending(true);
    setError("");
    setSuccess("");
    const result = await createRequest(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(result.success ?? "تم");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <input type="hidden" name="category" value={category} />
      <div className="grid gap-3 sm:grid-cols-2">
        {REQUEST_CATEGORIES.map((item) => {
          const Icon = icons[item.id];
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "rounded-3xl border p-4 text-right transition",
                active
                  ? "border-gold bg-gold-soft/40"
                  : "border-forest/10 bg-white hover:border-gold/40",
              )}
            >
              <Icon className="mb-2 h-7 w-7 text-forest" />
              <p className="text-lg font-black text-forest">{item.label}</p>
              <p className="text-sm text-muted">{item.hint}</p>
            </button>
          );
        })}
      </div>

      <VoiceRecorder onChange={setVoice} />

      <label className="block space-y-2">
        <span className="text-sm font-bold text-forest">
          لو في حد بيساعدك يقدر يكتب هنا
        </span>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-2xl border border-forest/15 bg-white p-4 outline-none focus:border-gold"
          placeholder="اختياري"
        />
      </label>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 font-semibold text-rose-800">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
          {success}
        </p>
      ) : null}

      <button
        disabled={pending}
        className="h-14 w-full rounded-2xl bg-forest text-lg font-black text-cream disabled:opacity-60"
      >
        {pending ? "جاري الإرسال..." : "ابعت الطلب"}
      </button>
    </form>
  );
}
