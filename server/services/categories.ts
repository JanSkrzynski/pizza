import sql from "./db";

export interface Category {
  id: number;
  created_at: string;
  name: string;
}
export async function getAllCategories(): Promise<Category[]> {
  const categories: Category[] = await sql`SELECT * FROM categories ORDER BY name`;
  return categories;
}

export async function addCategory(name: string): Promise<Category> {
  const [row] = await sql<Category[]>`
    INSERT INTO categories (name, created_at)
    VALUES (${name}, NOW())
    RETURNING *;
  `;
  return row;
}
