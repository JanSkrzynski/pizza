import sql from "./db";

export interface OrderedProduct {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderWithProducts {
  id: number;
  created_at: string;
  status: string;
  products: OrderedProduct[];
}

export interface Order {
  id: number;
  created_at: string;
  status: string;
}

// Fetch basic list of orders
export async function getAllOrders(): Promise<Order[]> {
  const orders: Order[] = await sql<Order[]>`
    SELECT * FROM orders
    ORDER BY created_at DESC;
  `;
  return orders;
}

// Fetch detailed orders including products
export async function getAllOrdersWithProducts(): Promise<OrderWithProducts[]> {
  const rows = await sql<
    {
      order_id: number;
      created_at: string;
      status: string;
      product_id: number;
      product_name: string;
      quantity: number;
      price: string;
    }[]
  >`
    SELECT
      o.id           AS order_id,
      o.created_at,
      o.status,
      p.id           AS product_id,
      p.name         AS product_name,
      op.quantity,
      op.price
    FROM orders o
    JOIN order_products op ON o.id = op.order_id
    JOIN products p       ON p.id = op.product_id
    ORDER BY o.created_at DESC;
  `;

  // Group rows into orders with products
  const map: Record<number, OrderWithProducts> = {};
  for (const row of rows) {
    if (!map[row.order_id]) {
      map[row.order_id] = {
        id: row.order_id,
        created_at: row.created_at,
        status: row.status,
        products: [],
      };
    }
    map[row.order_id].products.push({
      product_id: row.product_id,
      name: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
    });
  }

  return Object.values(map);
}

// Fetch one order by id with products
export async function getOrderByIdWithProducts(
  id: number
): Promise<OrderWithProducts | null> {
  const rows = await sql<
    {
      order_id: number;
      created_at: string;
      status: string;
      product_id: number;
      product_name: string;
      quantity: number;
      price: string;
    }[]
  >`
    SELECT
      o.id           AS order_id,
      o.created_at,
      o.status,
      p.id           AS product_id,
      p.name         AS product_name,
      op.quantity,
      op.price
    FROM orders o
    JOIN order_products op ON o.id = op.order_id
    JOIN products p       ON p.id = op.product_id
    WHERE o.id = ${id};
  `;

  if (rows.length === 0) return null;

  const order: OrderWithProducts = {
    id: rows[0].order_id,
    created_at: rows[0].created_at,
    status: rows[0].status,
    products: [],
  };

  for (const row of rows) {
    order.products.push({
      product_id: row.product_id,
      name: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
    });
  }

  return order;
}

// Create a new order
export async function createOrder(productIds: number[]): Promise<Order> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("productIds must be a non-empty array");
  }

  const [order] = await sql<Order[]>`
    INSERT INTO orders (created_at, status)
    VALUES (NOW(), 'pending')
    RETURNING *;
  `;

  for (const productId of productIds) {
    await sql`
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES (${order.id}, ${productId}, 1);
    `;
  }

  return order;
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<Order> {
  const [row] = await sql<Order[]>`
    UPDATE orders
       SET status = ${status}
     WHERE id = ${orderId}
    RETURNING *;
  `;
  return row;
}

export async function getTodayOrderCount(): Promise<number> {
  // PostgreSQL returns COUNT as text, so we parse it
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE created_at::DATE = now()::DATE;
  `;
  return parseInt(count, 10);
}

/**
 * Returns the number of orders placed today that are not yet completed.
 */
export async function getTodayPendingOrderCount(): Promise<number> {
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE created_at::DATE = now()::DATE
       AND status != 'completed';
  `;
  return parseInt(count, 10);
}

export async function getThisMonthOrderCount(): Promise<number> {
  // COUNT returns text, so parse it
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE date_trunc('month', created_at) = date_trunc('month', now());
  `;
  return parseInt(count, 10);
}

export async function getThisYearRevenue(): Promise<number> {
  const [{ total }] = await sql<{ total: string }[]>`
    SELECT
      COALESCE(SUM(op.price * op.quantity), 0)::TEXT AS total
    FROM order_products op
    JOIN orders o ON o.id = op.order_id
    WHERE date_trunc('year', o.created_at) = date_trunc('year', now());
  `;
  return parseFloat(total);
}
