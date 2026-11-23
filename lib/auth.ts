import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import type { Role } from "@prisma/client"

const COOKIE_NAME = "uninotes-token"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const DISABLED_DEMO_PASSWORD = "!disabled-default-password"

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === "production" && (!secret || secret.trim().length < 32 || secret.startsWith("your-super-secret"))) {
    throw new Error("Set a random JWT_SECRET of at least 32 characters in production")
  }
  if (secret && secret.trim().length > 0) {
    return new TextEncoder().encode(secret)
  }


  return new TextEncoder().encode("dev-only-jwt-secret-change-me")
}

export interface JWTPayload {
  sub: string
  email: string
  role: Role
  firstName: string
  lastName: string
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash === DISABLED_DEMO_PASSWORD) return false
  const bcrypt = await import("bcryptjs")
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: Omit<JWTPayload, "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + MAX_AGE)
    .setIssuedAt()
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"], requiredClaims: ["sub", "exp"] })
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export async function getCurrentUser() {
  const token = await getAuthCookie()
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { department: true },
  })
  return user?.passwordHash === DISABLED_DEMO_PASSWORD ? null : user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
  }
  return user
}
