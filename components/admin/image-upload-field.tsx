"use client";

import { useState } from "react";

export function ImageUploadField({
  name,
  label,
  hint,
  multiple = false,
  required = false,
}: {
  name: string;
  label: string;
  hint?: string;
  multiple?: boolean;
  required?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const buttonText = multiple ? "اختار الصور" : "اختار الصورة";

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-forest">{label}</p>
      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-forest/25 bg-sand px-4 py-5 text-center transition hover:border-forest hover:bg-gold-soft/40">
        <input
          name={name}
          type="file"
          accept="image/*"
          multiple={multiple}
          required={required}
          className="sr-only"
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        />
        <span className="inline-flex h-12 items-center rounded-2xl bg-forest px-6 text-lg font-black text-cream">
          {buttonText}
        </span>
        <span className="text-sm font-semibold text-muted">
          {files.length === 0
            ? hint ?? (multiple ? "دوس هنا ترفع صورة أو أكتر" : "دوس هنا ترفع الصورة")
            : files.length === 1
              ? files[0].name
              : `${files.length} صور: ${files.map((file) => file.name).join(" · ")}`}
        </span>
      </label>
    </div>
  );
}
