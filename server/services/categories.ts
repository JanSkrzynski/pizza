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
