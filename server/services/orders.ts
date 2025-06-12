import sql from "./db";

export async function getAllOrders() {
  const data = await sql`
    select *
    from orders`;
  return data;
}

export async function createOrder(productIds: number[]) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("productIds must be a non-empty array");
  }

  // Insert the order into the orders table
  const [order] = await sql`
    insert into orders (created_at)
    values (now())
    returning *`;

  // Insert each product into the order_products junction table
  for (const productId of productIds) {
    await sql`
      insert into order_products (order_id, product_id)
      values (${order.id}, ${productId})`;
  }

  return order;
}
