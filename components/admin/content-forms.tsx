"use client";

import { useActionState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import type { AboutSection, Achievement, ActionResult, LandingSlide } from "@/lib/types";

export function ContentForms({
  about,
  slides,
  achievements,
  saveAbout,
  addSlide,
  addAchievement,
  deleteSlide,
  deleteAchievement,
}: {
  about: AboutSection;
  slides: LandingSlide[];
  achievements: Achievement[];
  saveAbout: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  addSlide: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  addAchievement: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  deleteSlide: (formData: FormData) => Promise<void>;
  deleteAchievement: (formData: FormData) => Promise<void>;
}) {
  const [aboutState, aboutAction] = useActionState(saveAbout, {});
  const [slideState, slideAction] = useActionState(addSlide, {});
  const [achievementState, achievementAction] = useActionState(addAchievement, {});

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">السلايدر</h2>
        <form action={slideAction} className="mt-4 space-y-3">
          <input name="title" className="field" placeholder="العنوان على الصورة" />
          <input name="subtitle" className="field" placeholder="النص تحت العنوان" />
          <input name="image" type="file" accept="image/*" required />
          <Alert error={slideState.error} success={slideState.success} />
          <SubmitButton>إضافة صورة</SubmitButton>
        </form>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {slides.map((slide) => (
            <figure key={slide.id} className="overflow-hidden rounded-2xl bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image_url} alt={slide.title} className="h-32 w-full object-cover" />
              <figcaption className="p-3 text-sm font-bold">{slide.title || "بدون عنوان"}</figcaption>
              <form action={deleteSlide} className="px-3 pb-3">
                <input type="hidden" name="id" value={slide.id} />
                <button className="text-sm font-bold text-rose-700">حذف</button>
              </form>
            </figure>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">النبذة التعريفية</h2>
        <form action={aboutAction} className="mt-4 space-y-3">
          <input name="heading" defaultValue={about.heading} className="field" />
          <textarea name="body" defaultValue={about.body} className="field min-h-40" />
          <input name="image" type="file" accept="image/*" />
          <Alert error={aboutState.error} success={aboutState.success} />
          <SubmitButton>حفظ النبذة</SubmitButton>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">الإنجازات</h2>
        <form action={achievementAction} className="mt-4 space-y-3">
          <input name="title" className="field" placeholder="عنوان الإنجاز" required />
          <textarea name="body" className="field min-h-28" placeholder="وصف قصير" />
          <input name="image" type="file" accept="image/*" required />
          <Alert error={achievementState.error} success={achievementState.success} />
          <SubmitButton>إضافة إنجاز</SubmitButton>
        </form>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {achievements.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-2xl bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
              <figcaption className="p-3 text-sm font-bold">{item.title}</figcaption>
              <form action={deleteAchievement} className="px-3 pb-3">
                <input type="hidden" name="id" value={item.id} />
                <button className="text-sm font-bold text-rose-700">حذف</button>
              </form>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
