"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingSlide } from "@/lib/types";

export function LandingSlider({
  slides,
  siteName,
}: {
  slides: LandingSlide[];
  siteName: string;
}) {
  const [index, setIndex] = useState(0);
  const total = Math.max(slides.length, 1);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-forest-deep text-cream">
      <div className="absolute inset-0">
        {slide?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.image_url}
            alt={slide.title || siteName}
            className="h-full w-full object-cover opacity-55"
            style={{
              objectPosition: `${slide.focus_x ?? 50}% ${slide.focus_y ?? 50}%`,
            }}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#c9a22733,transparent_35%),linear-gradient(135deg,#08241c,#0d3b2e_55%,#1a5a43)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28">
        <p className="mb-3 text-sm font-bold tracking-[0.2em] text-gold-soft">
          مجلس النواب
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
          {slide?.title || siteName}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-9 text-cream/90 md:text-xl">
          {slide?.subtitle ||
            "باب المكتب مفتوح لطلبات الأهالي، ومتابعة الحالة، وحجز المواعيد."}
        </p>

        {slides.length > 1 ? (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIndex((current) => (current - 1 + total) % total)}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {slides.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className={`h-2 rounded-full transition-all ${
                    itemIndex === index ? "w-8 bg-gold" : "w-2 bg-white/40"
                  }`}
                  aria-label={`شريحة ${itemIndex + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % total)}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
