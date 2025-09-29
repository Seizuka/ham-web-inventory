import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const res = await query(
    `SELECT users.id, users.email, users.password_hash, users.avatar_url, roles.name AS role
     FROM users
     JOIN roles ON users.role_id = roles.id
     WHERE users.email = $1
     LIMIT 1`,
    [email]
  );
  if (!res.rows[0]) return null;
  const u = res.rows[0];
  return {
    id: u.id,
    email: u.email,
    password_hash: u.password_hash,
    role: u.role,
    avatarUrl: u.avatar_url || null,
  };
}

export async function getUserById(id: string) {
  const res = await query(
    `SELECT users.id, users.email, users.avatar_url, roles.name AS role
     FROM users
     JOIN roles ON users.role_id = roles.id
     WHERE users.id = $1
     LIMIT 1`,
    [id]
  );
  if (!res.rows[0]) return null;
  const u = res.rows[0];
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatar_url || null,
  };
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const data = verifyToken(token);
  if (!data) return null;
  return await getUserById(data.id);
}
