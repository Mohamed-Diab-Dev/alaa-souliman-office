"use client";

import { useActionState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import { ImageFocusControl } from "@/components/admin/image-focus-control";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { AboutSection, ActionResult, LandingSlide } from "@/lib/types";

export function ContentForms({
  about,
  slides,
  saveAbout,
  addSlide,
  updateSlideFocus,
  deleteSlide,
}: {
  about: AboutSection;
  slides: LandingSlide[];
  saveAbout: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  addSlide: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  updateSlideFocus: (
    prev: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  deleteSlide: (formData: FormData) => Promise<void>;
}) {
  const [aboutState, aboutAction] = useActionState(saveAbout, {});
  const [slideState, slideAction] = useActionState(addSlide, {});

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">سلايدر الرئيسية</h2>
        <form action={slideAction} className="mt-4 space-y-3">
          <input name="title" className="field" placeholder="العنوان على الصورة" />
          <input name="subtitle" className="field" placeholder="النص تحت العنوان" />
          <ImageUploadField name="image" label="صورة السلايد" required />
          <ImageFocusControl />
          <Alert error={slideState.error} success={slideState.success} />
          <SubmitButton>إضافة صورة</SubmitButton>
        </form>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {slides.map((slide) => (
            <SlideFocusCard
              key={slide.id}
              slide={slide}
              updateSlideFocus={updateSlideFocus}
              deleteSlide={deleteSlide}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">النبذة التعريفية</h2>
        <form action={aboutAction} className="mt-4 space-y-3">
          <input name="heading" defaultValue={about.heading} className="field" />
          <textarea name="body" defaultValue={about.body} className="field min-h-40" />
          <ImageUploadField name="image" label="صورة النبذة" />
          <Alert error={aboutState.error} success={aboutState.success} />
          <SubmitButton>حفظ النبذة</SubmitButton>
        </form>
      </section>
    </div>
  );
}

function SlideFocusCard({
  slide,
  updateSlideFocus,
  deleteSlide,
}: {
  slide: LandingSlide;
  updateSlideFocus: (
    prev: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  deleteSlide: (formData: FormData) => Promise<void>;
}) {
  const [state, action] = useActionState(updateSlideFocus, {});

  return (
    <figure className="overflow-hidden rounded-2xl bg-sand">
      <figcaption className="border-b border-black/5 px-4 py-3 text-sm font-bold text-forest">
        {slide.title || "بدون عنوان"}
      </figcaption>
      <form action={action} className="space-y-3 p-4">
        <input type="hidden" name="id" value={slide.id} />
        <ImageFocusControl
          imageUrl={slide.image_url}
          defaultX={slide.focus_x}
          defaultY={slide.focus_y}
        />
        <Alert error={state.error} success={state.success} />
        <SubmitButton>حفظ موضع الصورة</SubmitButton>
      </form>
      <form action={deleteSlide} className="px-4 pb-4">
        <input type="hidden" name="id" value={slide.id} />
        <button type="submit" className="text-sm font-bold text-rose-700">
          حذف
        </button>
      </form>
    </figure>
  );
}
