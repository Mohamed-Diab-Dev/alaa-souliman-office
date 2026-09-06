"use client";

import { useState } from "react";

const presets = [
  { label: "وسط", x: 50, y: 50 },
  { label: "يمين", x: 85, y: 50 },
  { label: "شمال", x: 15, y: 50 },
  { label: "أعلى", x: 50, y: 15 },
  { label: "أسفل", x: 50, y: 85 },
  { label: "يمين أعلى", x: 85, y: 20 },
  { label: "شمال أعلى", x: 15, y: 20 },
  { label: "يمين أسفل", x: 85, y: 80 },
  { label: "شمال أسفل", x: 15, y: 80 },
];

export function ImageFocusControl({
  imageUrl,
  defaultX = 50,
  defaultY = 50,
  nameX = "focus_x",
  nameY = "focus_y",
}: {
  imageUrl?: string;
  defaultX?: number;
  defaultY?: number;
  nameX?: string;
  nameY?: string;
}) {
  const [x, setX] = useState(defaultX);
  const [y, setY] = useState(defaultY);

  function setFocus(nextX: number, nextY: number) {
    setX(Math.max(0, Math.min(100, Math.round(nextX))));
    setY(Math.max(0, Math.min(100, Math.round(nextY))));
  }

  return (
    <div className="space-y-3 rounded-2xl bg-sand/70 p-4">
      <input type="hidden" name={nameX} value={x} />
      <input type="hidden" name={nameY} value={y} />
      <div>
        <p className="text-sm font-bold text-forest">الجزء الظاهر من الصورة</p>
        <p className="mt-1 text-sm leading-7 text-muted">
          دوس على الصورة أو اختار موضع جاهز عشان تحدد إيه اللي يظهر في السلايدر.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setFocus(preset.x, preset.y)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              x === preset.x && y === preset.y
                ? "bg-forest text-cream"
                : "bg-white text-forest"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {imageUrl ? (
        <button
          type="button"
          className="relative block w-full overflow-hidden rounded-2xl bg-forest-deep"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const nextX = ((event.clientX - rect.left) / rect.width) * 100;
            const nextY = ((event.clientY - rect.top) / rect.height) * 100;
            setFocus(nextX, nextY);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-48 w-full object-cover"
            style={{ objectPosition: `${x}% ${y}%` }}
          />
          <span
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold shadow"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </button>
      ) : (
        <p className="rounded-2xl bg-white px-3 py-2 text-sm text-muted">
          بعد اختيار الصورة، عدّل الموضع من قائمة السلايدات تحت أو اختار موضع جاهز دلوقتي.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-bold text-forest">
          يمين ↔ شمال
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(event) => setFocus(Number(event.target.value), y)}
            className="w-full"
          />
        </label>
        <label className="space-y-1 text-sm font-bold text-forest">
          أعلى ↔ أسفل
          <input
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(event) => setFocus(x, Number(event.target.value))}
            className="w-full"
          />
        </label>
      </div>
    </div>
  );
}
