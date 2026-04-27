import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error("Falta ADMIN_JWT_SECRET en .env.local");
}

type AdminTokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function createAdminToken(payload: AdminTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as AdminTokenPayload;
}