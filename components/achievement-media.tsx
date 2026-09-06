"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AchievementImage } from "@/lib/types";

export function AchievementMedia({
  title,
  body,
  images,
  variant = "tile",
  number,
  flip = false,
}: {
  title: string;
  body?: string;
  images: AchievementImage[];
  variant?: "hero" | "tile";
  number?: string;
  flip?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const urls = images.map((item) => item.image_url).filter(Boolean);
  const hero = variant === "hero";

  useEffect(() => {
    if (urls.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % urls.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [urls.length, paused]);

  const current = urls[index] ?? urls[0];

  return (
    <article
      className="grid items-center gap-5 md:grid-cols-12 md:gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`achievement-frame group relative w-full overflow-hidden bg-transparent ${
          flip ? "order-2 md:order-2" : "order-1 md:order-1"
        } ${
          hero
            ? "rounded-[1.8rem] md:col-span-7 md:rounded-[2.2rem]"
            : "rounded-[1.5rem] md:col-span-7 md:rounded-[1.8rem]"
        }`}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={title}
            className="block h-auto w-full"
          />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-forest text-cream">
            بدون صورة
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-gold/25" />

        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {number ? (
            <span className="rounded-full border border-gold/40 bg-black/40 px-3 py-1 text-xs font-black tracking-[0.18em] text-gold-soft backdrop-blur-md">
              {number}
            </span>
          ) : null}
          {urls.length > 1 ? (
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-cream backdrop-blur-md">
              سلايدر {urls.length}
            </span>
          ) : (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-forest-deep">
              إنجاز
            </span>
          )}
        </div>

        {urls.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() =>
                setIndex((currentIndex) => (currentIndex - 1 + urls.length) % urls.length)
              }
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((currentIndex) => (currentIndex + 1) % urls.length)}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {urls.map((url, itemIndex) => (
                <button
                  key={url + itemIndex}
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className={`h-1.5 rounded-full transition ${
                    itemIndex === index ? "w-8 bg-gold" : "w-2.5 bg-white/50"
                  }`}
                  aria-label={`صورة ${itemIndex + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div
        className={`flex flex-col justify-center ${
          flip ? "order-1 md:order-1" : "order-2 md:order-2"
        } ${hero ? "gap-4 md:col-span-5 md:px-2" : "gap-3 md:col-span-5 md:px-2"}`}
      >
        <p className="text-xs font-bold tracking-[0.22em] text-gold">إنجاز المكتب</p>
        <div className="h-px w-16 bg-gradient-to-l from-gold to-transparent" />
        <h2
          className={`font-black leading-[1.35] text-forest ${
            hero ? "text-2xl md:text-4xl" : "text-xl md:text-3xl"
          }`}
        >
          {title}
        </h2>
        {body ? (
          <p
            className={`whitespace-pre-line leading-9 text-muted ${
              hero ? "text-base md:text-lg" : "text-sm md:text-base"
            }`}
          >
            {body}
          </p>
        ) : null}
      </div>
    </article>
  );
}
