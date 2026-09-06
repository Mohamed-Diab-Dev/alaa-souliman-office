"use client";

import { useActionState, useState } from "react";
import {
  addAchievement,
  addAchievementImages,
  deleteAchievement,
  deleteAchievementImage,
  moveAchievement,
  updateAchievement,
} from "@/app/actions/admin-achievements";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Achievement } from "@/lib/types";

export function AchievementForms({ achievements }: { achievements: Achievement[] }) {
  const [createState, createAction] = useActionState(addAchievement, {});

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 card-shadow">
        <h2 className="text-xl font-black text-forest">إضافة إنجاز</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          اكتب العنوان والوصف، وبعدين ارفع صورة واحدة أو أكتر. صورة واحدة تظهر ثابتة،
          أكتر من صورة تظهر سلايدر للمواطن. الترتيب هنا هو نفس ترتيب صفحة الإنجازات.
        </p>
        <form action={createAction} className="mt-4 space-y-3">
          <input name="title" className="field" placeholder="عنوان الإنجاز" required />
          <textarea name="body" className="field min-h-28" placeholder="وصف الإنجاز" />
          <ImageUploadField
            name="images"
            label="الصور"
            hint="دوس على الزرار ترفع صورة واحدة أو أكتر"
            multiple
            required
          />
          <Alert error={createState.error} success={createState.success} />
          <SubmitButton>إضافة إنجاز</SubmitButton>
        </form>
      </section>

      <div className="space-y-5">
        {achievements.map((item, index) => (
          <AchievementCard
            key={item.id}
            achievement={item}
            index={index}
            total={achievements.length}
          />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
  index,
  total,
}: {
  achievement: Achievement;
  index: number;
  total: number;
}) {
  const [editing, setEditing] = useState(false);
  const [imagesState, imagesAction] = useActionState(addAchievementImages, {});
  const [editState, editAction] = useActionState(updateAchievement, {});

  return (
    <article className="rounded-3xl bg-white p-5 card-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gold">الترتيب: {index + 1}</p>
          <h3 className="mt-1 text-xl font-black text-forest">{achievement.title}</h3>
          {achievement.body ? (
            <p className="mt-2 max-w-2xl leading-8 text-muted">{achievement.body}</p>
          ) : null}
          <p className="mt-2 text-sm font-bold text-gold">
            {achievement.images.length > 1
              ? `سلايدر ${achievement.images.length} صور`
              : "صورة واحدة"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={moveAchievement}>
            <input type="hidden" name="id" value={achievement.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              disabled={index === 0}
              className="rounded-full border border-forest/20 px-3 py-2 text-sm font-bold text-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              أعلى
            </button>
          </form>
          <form action={moveAchievement}>
            <input type="hidden" name="id" value={achievement.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              disabled={index >= total - 1}
              className="rounded-full border border-forest/20 px-3 py-2 text-sm font-bold text-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              أسفل
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream"
          >
            {editing ? "إغلاق التعديل" : "تعديل الإنجاز"}
          </button>
          <form action={deleteAchievement}>
            <input type="hidden" name="id" value={achievement.id} />
            <button className="text-sm font-bold text-rose-700">حذف الإنجاز</button>
          </form>
        </div>
      </div>

      {editing ? (
        <form action={editAction} className="mt-4 space-y-3 rounded-2xl bg-sand/70 p-4">
          <input type="hidden" name="id" value={achievement.id} />
          <input
            name="title"
            className="field"
            defaultValue={achievement.title}
            placeholder="عنوان الإنجاز"
            required
          />
          <textarea
            name="body"
            className="field min-h-28"
            defaultValue={achievement.body}
            placeholder="وصف الإنجاز"
          />
          <Alert error={editState.error} success={editState.success} />
          <SubmitButton>حفظ التعديل</SubmitButton>
        </form>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {achievement.images.map((image) => (
          <figure key={image.id} className="overflow-hidden rounded-2xl bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.image_url} alt="" className="h-32 w-full object-cover" />
            <form action={deleteAchievementImage} className="p-2">
              <input type="hidden" name="id" value={image.id} />
              <input type="hidden" name="achievement_id" value={achievement.id} />
              <input type="hidden" name="image_url" value={image.image_url} />
              <button className="text-sm font-bold text-rose-700">حذف الصورة</button>
            </form>
          </figure>
        ))}
      </div>

      <form action={imagesAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={achievement.id} />
        <ImageUploadField
          name="images"
          label="إضافة صور تانية للسلايدر"
          hint="دوس على الزرار ترفع صور جديدة"
          multiple
        />
        <Alert error={imagesState.error} success={imagesState.success} />
        <SubmitButton>إضافة الصور</SubmitButton>
      </form>
    </article>
  );
}
