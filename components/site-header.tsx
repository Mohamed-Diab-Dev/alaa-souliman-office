"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutCitizen } from "@/app/actions/citizen-auth";
import { Emblem } from "@/components/emblem";
import type { CitizenSession } from "@/lib/types";

export function SiteHeader({
  siteName,
}: {
  siteName: string;
}) {
  const [citizen, setCitizen] = useState<CitizenSession | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then((response) => response.json())
      .then((data) => {
        if (active) setCitizen(data.citizen ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/achievements", label: "الإنجازات" },
    ...(citizen ? [{ href: "/requests", label: "طلباتي" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Emblem className="h-11 w-11" />
          <div>
            <p className="text-sm font-bold text-forest">{siteName}</p>
            <p className="text-xs text-muted">خدمة المواطنين</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-forest md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {citizen ? (
            <>
              <span className="hidden max-w-36 truncate text-sm text-muted sm:block">
                {citizen.name}
              </span>
              <form action={logoutCitizen}>
                <button className="rounded-full border border-forest/15 px-4 py-2 text-sm font-semibold text-forest hover:bg-sand">
                  خروج
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-forest px-5 py-2 text-sm font-bold text-cream hover:bg-forest-deep"
            >
              دخول
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-forest/5 px-4 py-2 text-sm font-semibold text-forest md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
