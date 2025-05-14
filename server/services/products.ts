import sql from "./db";

export interface Product {
  id: number;
  name: string;
  price: number;
  desciption?: string;
  image_url?: string;
  created_at: string;
}

export async function getAllProducts() {
  const products = await sql` select * 
                        from products
                        order by created_at `;
  return products;
}
