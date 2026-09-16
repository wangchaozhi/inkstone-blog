import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("Set SESSION_SECRET (32+ characters)");
  return new TextEncoder().encode(s);
}
export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) return false;
  return timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
export async function isAdmin() {
  const token = (await cookies()).get("inkstone-session")?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
      issuer: "inkstone",
      audience: "admin",
    });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/login");
}
export async function startSession() {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer("inkstone")
    .setAudience("admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key());
  (await cookies()).set("inkstone-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
}
