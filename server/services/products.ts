import sql from "./db";

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  desciption?: string;
  image_url?: string;
  created_at: string;
  category_id: number;
}

export async function getAllProducts(): Promise<Product[]> {
  const products: Product[] = await sql` select * 
                        from products
                        order by created_at `;
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const products: Product[] = await sql` select * 
                        from products
                        where slug = ${slug} `;
  return products[0];
}

export async function addProduct(
  name: string,
  description: string,
  price: number,
  image_url: string,
  slug: string,
  category_id: number
) {
  const data = await sql`
  insert into products (name, price, description, image_url, slug, category_id)
  values (${name}, ${price}, ${description}, ${image_url}, ${slug}, ${category_id})`;
  return data;
}

export async function updateProduct(
  id: number,
  name: string,
  description: string | null,
  price: number,
  image_url: string | null,
  slug: string,
  category_id: number
): Promise<Product> {
  const [row] = await sql<Product[]>`
    UPDATE products
       SET name        = ${name},
           description = ${description},
           price       = ${price},
           image_url   = ${image_url},
           slug        = ${slug},
           category_id = ${category_id}
     WHERE id = ${id}
    RETURNING *;
  `;
  return row;
}
