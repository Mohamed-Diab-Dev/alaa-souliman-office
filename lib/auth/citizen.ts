import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CITIZEN_COOKIE,
  CITIZEN_SESSION_DAYS,
} from "@/lib/constants";
import type { CitizenSession } from "@/lib/types";

function getSecret() {
  const secret =
    process.env.CITIZEN_SESSION_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-citizen-session-secret-change-me-now"
      : "");
  if (!secret || secret.length < 32) {
    throw new Error("CITIZEN_SESSION_SECRET لازم يكون 32 حرف على الأقل");
  }
  return new TextEncoder().encode(secret);
}

export async function signCitizenToken(session: CitizenSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CITIZEN_SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifyCitizenToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.id || !payload.name || !payload.nationalId) return null;
    return {
      id: String(payload.id),
      name: String(payload.name),
      nationalId: String(payload.nationalId),
    } satisfies CitizenSession;
  } catch {
    return null;
  }
}

export async function getCitizenSession() {
  try {
    const jar = await cookies();
    const token = jar.get(CITIZEN_COOKIE)?.value;
    if (!token) return null;
    return verifyCitizenToken(token);
  } catch {
    return null;
  }
}

export async function requireCitizen() {
  const session = await getCitizenSession();
  if (!session) redirect("/login");
  return session;
}

export async function setCitizenCookie(session: CitizenSession) {
  const token = await signCitizenToken(session);
  const jar = await cookies();
  jar.set(CITIZEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CITIZEN_SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearCitizenCookie() {
  const jar = await cookies();
  jar.delete(CITIZEN_COOKIE);
}
