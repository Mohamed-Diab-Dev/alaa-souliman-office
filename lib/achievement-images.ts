import type { AchievementImage } from "@/lib/types";

export function decodeAchievementImages(value: string | null | undefined) {
  if (!value) return [] as string[];
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
      }
    } catch {
      return [value];
    }
  }
  return [value];
}

export function encodeAchievementImages(urls: string[]) {
  const clean = urls.filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? "";
  return JSON.stringify(clean);
}

export function imagesFromAchievementRow(row: {
  id: string;
  image_url: string;
  achievement_images?: { id: string; image_url: string; sort_order: number }[] | null;
}): AchievementImage[] {
  const nested = Array.isArray(row.achievement_images) ? row.achievement_images : [];
  if (nested.length > 0) {
    return [...nested].sort((a, b) => a.sort_order - b.sort_order);
  }

  return decodeAchievementImages(row.image_url).map((image_url, index) => ({
    id: `${row.id}:${index}`,
    image_url,
    sort_order: index,
  }));
}

export function isMissingAchievementImagesTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.message?.includes("achievement_images") === true
  );
}
