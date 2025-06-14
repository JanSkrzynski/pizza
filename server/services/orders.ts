// server/services/orders.ts
import sql from "./db";

// ————— Types —————

export interface OrderedProduct {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderWithProducts {
  id: number;
  user_id: string;
  created_at: string;
  status: string;
  products: OrderedProduct[];
}

export interface Order {
  id: number;
  user_id: string;
  created_at: string;
  status: string;
}

// ————— Fetchers —————

/** 1) All orders (admin) without product details */
export async function getAllOrders(): Promise<Order[]> {
  return await sql<Order[]>`
    SELECT * FROM orders
    ORDER BY created_at DESC;
  `;
}

/** 2) All orders with products (admin) */
export async function getAllOrdersWithProducts(): Promise<OrderWithProducts[]> {
  const rows = await sql<
    {
      order_id: number;
      user_id: string;
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
      o.user_id      AS user_id,
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

  const map: Record<number, OrderWithProducts> = {};
  for (const r of rows) {
    if (!map[r.order_id]) {
      map[r.order_id] = {
        id: r.order_id,
        user_id: r.user_id,
        created_at: r.created_at,
        status: r.status,
        products: [],
      };
    }
    map[r.order_id].products.push({
      product_id: r.product_id,
      name: r.product_name,
      quantity: r.quantity,
      price: parseFloat(r.price),
    });
  }
  return Object.values(map);
}

/** 3) Single order with products (admin & owner) */
export async function getOrderByIdWithProducts(
  orderId: number
): Promise<OrderWithProducts | null> {
  const rows = await sql<
    {
      order_id: number;
      user_id: string;
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
      o.user_id      AS user_id,
      o.created_at,
      o.status,
      p.id           AS product_id,
      p.name         AS product_name,
      op.quantity,
      op.price
    FROM orders o
    JOIN order_products op ON o.id = op.order_id
    JOIN products p       ON p.id = op.product_id
    WHERE o.id = ${orderId};
  `;

  if (rows.length === 0) return null;

  const first = rows[0];
  const order: OrderWithProducts = {
    id: first.order_id,
    user_id: first.user_id,
    created_at: first.created_at,
    status: first.status,
    products: [],
  };
  for (const r of rows) {
    order.products.push({
      product_id: r.product_id,
      name: r.product_name,
      quantity: r.quantity,
      price: parseFloat(r.price),
    });
  }
  return order;
}

/** 4) Orders by a specific user (customer view) */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  return await sql<Order[]>`
    SELECT *
      FROM orders
     WHERE user_id = ${userId}
  ORDER BY created_at DESC;
  `;
}

// ————— Creators —————

/**
 * Old simple version: quantity=1, no user
 * (Deprecated, used internally for tests or one-off scripts)
 */
export async function createOrderSimple(productIds: number[]): Promise<Order> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("productIds must be a non-empty array");
  }
  const [order] = await sql<Order[]>`
    INSERT INTO orders (created_at, status)
    VALUES (NOW(), 'pending')
    RETURNING *;
  `;
  for (const pid of productIds) {
    await sql`
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES (${order.id}, ${pid}, 1);
    `;
  }
  return order;
}

/**
 * New version: accepts a userId and detailed items array
 */
export async function createOrder(
  userId: string,
  items: { product_id: number; quantity: number }[]
): Promise<Order> {
  if (!items.length) {
    throw new Error("At least one item is required");
  }
  const [order] = await sql<Order[]>`
    INSERT INTO orders (user_id, created_at, status)
    VALUES (${userId}, NOW(), 'pending')
    RETURNING *;
  `;
  for (const it of items) {
    await sql`
      INSERT INTO order_products (order_id, product_id, quantity, price)
      VALUES (${order.id}, ${it.product_id}, ${it.quantity}, 
        (SELECT price FROM products WHERE id = ${it.product_id})
      );
    `;
  }
  return order;
}

// ————— Updaters —————

/** Change status (pending → completed → canceled) */
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

// ————— Statistics —————

export async function getTodayOrderCount(): Promise<number> {
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE created_at::DATE = NOW()::DATE;
  `;
  return parseInt(count, 10);
}

export async function getTodayPendingOrderCount(): Promise<number> {
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE created_at::DATE = NOW()::DATE
       AND status != 'completed';
  `;
  return parseInt(count, 10);
}

export async function getThisMonthOrderCount(): Promise<number> {
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count
      FROM orders
     WHERE date_trunc('month', created_at) = date_trunc('month', NOW());
  `;
  return parseInt(count, 10);
}

export async function getThisYearRevenue(): Promise<number> {
  const [{ total }] = await sql<{ total: string }[]>`
    SELECT COALESCE(SUM(op.price * op.quantity), 0)::TEXT AS total
      FROM order_products op
      JOIN orders o ON o.id = op.order_id
     WHERE date_trunc('year', o.created_at) = date_trunc('year', NOW());
  `;
  return parseFloat(total);
}
