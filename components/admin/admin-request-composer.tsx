"use client";

import { useActionState, useState, useTransition } from "react";
import { Briefcase, FileText, HelpCircle, ShieldAlert, Wallet } from "lucide-react";
import {
  createAdminRequest,
  lookupCitizenByNationalId,
  type CitizenLookup,
} from "@/app/actions/admin-requests";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import { REQUEST_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  support: Wallet,
  complaint: ShieldAlert,
  papers: FileText,
  job: Briefcase,
  other: HelpCircle,
};

export function AdminRequestComposer() {
  const [lookupError, setLookupError] = useState("");
  const [citizen, setCitizen] = useState<CitizenLookup | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [category, setCategory] = useState("support");
  const [pendingLookup, startLookup] = useTransition();
  const [state, action] = useActionState(createAdminRequest, {});

  function searchCitizen() {
    startLookup(async () => {
      setLookupError("");
      setCitizen(null);
      const result = await lookupCitizenByNationalId(nationalId);
      if (result.error) {
        setLookupError(result.error);
        return;
      }
      setCitizen(result.citizen ?? null);
    });
  }

  return (
    <section className="rounded-3xl bg-white p-6 card-shadow">
      <h2 className="text-xl font-black text-forest">تسجيل طلب جديد</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        اكتب الرقم القومي للمواطن المسجّل، هتظهر بياناته، وبعدين اكتب الطلب.
        الطلب هيرتبط بحسابه ويظهر له لما يدخل.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="min-w-[16rem] flex-1 space-y-1">
          <span className="text-sm font-bold text-forest">الرقم القومي</span>
          <input
            className="field"
            inputMode="numeric"
            maxLength={14}
            value={nationalId}
            onChange={(event) => setNationalId(event.target.value)}
            placeholder="14 رقم"
          />
        </label>
        <button
          type="button"
          onClick={searchCitizen}
          disabled={pendingLookup}
          className="mt-6 h-12 rounded-2xl bg-forest px-5 font-black text-cream disabled:opacity-60"
        >
          {pendingLookup ? "جاري البحث..." : "بحث"}
        </button>
      </div>

      {lookupError ? (
        <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {lookupError}
        </p>
      ) : null}

      {citizen ? (
        <div className="mt-4 rounded-2xl bg-sand px-4 py-4">
          <p className="text-lg font-black text-forest">{citizen.name}</p>
          <p className="mt-1 text-sm text-muted">الرقم القومي: {citizen.nationalId}</p>
          <p className="mt-1 text-sm text-muted">العنوان: {citizen.address || "—"}</p>
          <p className="mt-1 text-sm text-muted">
            التليفون: {citizen.phones.length ? citizen.phones.join(" / ") : "—"}
          </p>
        </div>
      ) : null}

      {citizen ? (
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="citizen_id" value={citizen.id} />
          <input type="hidden" name="category" value={category} />

          <div>
            <p className="mb-2 text-sm font-bold text-forest">نوع الطلب</p>
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
                    <Icon className="mb-2 h-6 w-6 text-forest" />
                    <p className="font-black text-forest">{item.label}</p>
                    <p className="text-sm text-muted">{item.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-bold text-forest">نص الطلب</span>
            <textarea
              name="notes"
              className="field min-h-36"
              required
              placeholder="اكتب تفاصيل الطلب هنا"
            />
          </label>

          <Alert error={state.error} success={state.success} />
          <SubmitButton>تسجيل الطلب للمواطن</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
