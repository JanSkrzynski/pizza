import sql from "./db";

export interface Order {
  id: number;
  created_at: string;
  status: string;
}

export async function getAllOrders(): Promise<Order[]> {
  const orders: Order[] = await sql`
    SELECT * FROM orders
    ORDER BY created_at DESC;
  `;
  return orders;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const orders: Order[] = await sql`
    SELECT * FROM orders
    WHERE id = ${id};
  `;
  return orders.length > 0 ? orders[0] : null;
}

export async function createOrder(productIds: number[]): Promise<Order> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("productIds must be a non-empty array");
  }

  // create the order row
  const [order] = await sql<Order[]>`
    INSERT INTO orders (created_at, status)
    VALUES (NOW(), 'pending')
    RETURNING *;
  `;

  // link each product with quantity = 1
  for (const productId of productIds) {
    await sql`
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES (${order.id}, ${productId}, 1);
    `;
  }

  return order;
}
