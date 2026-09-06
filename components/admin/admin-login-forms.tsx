"use client";

import { useActionState } from "react";
import { bootstrapAdmin, loginAdmin } from "@/app/actions/admin-auth";
import { Alert, SubmitButton } from "@/components/admin/form-status";

export function AdminLoginForms({ needsBootstrap }: { needsBootstrap: boolean }) {
  const [loginState, loginAction] = useActionState(loginAdmin, {});
  const [bootState, bootAction] = useActionState(bootstrapAdmin, {});

  if (needsBootstrap) {
    return (
      <form action={bootAction} className="space-y-4">
        <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
          أول مرة: أنشئ حساب الأدمن الرئيسي.
        </p>
        <input name="name" placeholder="اسم المدير" className="field" required />
        <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" required />
        <input name="password" type="password" placeholder="كلمة السر" className="field" required />
        <Alert error={bootState.error} success={bootState.success} />
        <SubmitButton>إنشاء حساب الأدمن</SubmitButton>
      </form>
    );
  }

  return (
    <form action={loginAction} className="space-y-4">
      <input name="email" type="email" placeholder="البريد الإلكتروني" className="field" required />
      <input name="password" type="password" placeholder="كلمة السر" className="field" required />
      <Alert error={loginState.error} success={loginState.success} />
      <SubmitButton>دخول</SubmitButton>
    </form>
  );
}
