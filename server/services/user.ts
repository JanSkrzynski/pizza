import sql from "./db";
import bcrypt from "bcrypt";

export interface User {
  id: string; // UUID
  email: string;
  role: string;
  created_at: string;
}

export async function getAllUsers(): Promise<User[]> {
  return await sql<User[]>`
    SELECT id, email, role, created_at
      FROM users
     ORDER BY created_at DESC;
  `;
}

export async function addUser(
  email: string,
  rawPassword: string,
  role: string
): Promise<User> {
  const password_hash = await bcrypt.hash(rawPassword, 10);

  const [row] = await sql<User[]>`
    INSERT INTO users (email, password_hash, role, created_at)
    VALUES (${email}, ${password_hash}, ${role}, NOW())
    RETURNING id, email, role, created_at;
  `;
  return row;
}
