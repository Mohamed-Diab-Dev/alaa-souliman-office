"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "h-12 rounded-2xl bg-forest px-5 font-black text-cream disabled:opacity-60",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {pending ? "جاري الحفظ..." : children}
    </button>
  );
}

export function Alert({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
        error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? success}
    </p>
  );
}
