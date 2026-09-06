import { Emblem } from "@/components/emblem";

export function SiteFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="mt-auto border-t border-forest/10 bg-forest-deep text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Emblem className="h-10 w-10" />
          <div>
            <p className="font-bold">{siteName}</p>
            <p className="text-sm text-gold-soft">مجلس النواب · خدمة المواطنين</p>
          </div>
        </div>
        <p className="max-w-md text-sm leading-7 text-cream/75">
          الطلبات تظهر لصاحبها فقط بعد تسجيل الدخول بالرقم القومي ورقم التليفون
          المسجّل في المكتب.
        </p>
      </div>
    </footer>
  );
}
