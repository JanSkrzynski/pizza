import sql from "./db";

export async function getAllOrders() {
  const data = await sql`
    select *
    from orders`;
  return data;
}
