import sql from "./db";

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

export async function addUser(email: string, role: string): Promise<User> {
  const [row] = await sql<User[]>`
    INSERT INTO users (email, role, created_at)
    VALUES (${email}, ${role}, NOW())
    RETURNING id, email, role, created_at;
  `;
  return row;
}
