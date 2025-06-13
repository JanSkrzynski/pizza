import sql from "./db";

export interface Category {
  id: number;
  created_at: string;
  name: string;
}

/**
 * Fetch all categories, ordered by name.
 */
export async function getAllCategories(): Promise<Category[]> {
  return await sql<Category[]>`
    SELECT * 
      FROM categories
  ORDER BY name;
  `;
}

/**
 * Fetch a single category by its ID.
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await sql<Category[]>`
    SELECT *
      FROM categories
     WHERE id = ${id};
  `;
  return rows.length ? rows[0] : null;
}

/**
 * Insert a new category.
 */
export async function addCategory(name: string): Promise<Category> {
  const [row] = await sql<Category[]>`
    INSERT INTO categories (name, created_at)
    VALUES (${name}, NOW())
    RETURNING *;
  `;
  return row;
}

/**
 * Update an existing category’s name.
 */
export async function updateCategory(
  id: number,
  name: string
): Promise<Category> {
  const [row] = await sql<Category[]>`
    UPDATE categories
       SET name = ${name}
     WHERE id = ${id}
    RETURNING *;
  `;
  return row;
}

/**
 * Delete a category by its ID.
 */
export async function deleteCategory(id: number): Promise<void> {
  await sql`
    DELETE FROM categories
     WHERE id = ${id};
  `;
}
