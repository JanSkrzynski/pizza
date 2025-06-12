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
