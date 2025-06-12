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
