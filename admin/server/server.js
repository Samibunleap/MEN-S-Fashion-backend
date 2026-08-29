import http from "node:http";
import pool from "./db.js";

const PORT = process.env.PORT || 8080;

/* =========================
   SEND JSON RESPONSE
========================= */

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });

  res.end(JSON.stringify(data));
}

/* =========================
   READ REQUEST BODY
========================= */

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

/* =========================
   DATABASE CONNECTION TEST
========================= */

async function testDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL Database connected successfully!");

    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:");
    console.error(error.message);
  }
}

testDatabase();

/* =========================
   CREATE SERVER
========================= */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return send(res, 204, {});
  }

  const url = new URL(
    req.url,
    `http://${req.headers.host}`
  );

  const pathname = url.pathname;

  try {

    /* =========================
       BACKEND HOME
    ========================= */

    if (req.method === "GET" && pathname === "/") {
      return send(res, 200, {
        message: "MEN'S Fashion Admin Backend is running",
        status: "success"
      });
    }

    /* =========================
       HEALTH CHECK
    ========================= */

    if (req.method === "GET" && pathname === "/api/health") {
      return send(res, 200, {
        message: "MEN'S Fashion Admin API is running",
        database: "MySQL"
      });
    }

    /* =========================
       LOGIN
    ========================= */

    if (
      req.method === "POST" &&
      pathname === "/api/auth/login"
    ) {
      const { username, password } = await readBody(req);

      const [users] = await pool.query(
        `
        SELECT id, username, name, role
        FROM users
        WHERE username = ?
        AND password = ?
        `,
        [username, password]
      );

      if (users.length === 0) {
        return send(res, 401, {
          message: "Invalid username or password"
        });
      }

      const user = users[0];

      return send(res, 200, {
        message: "Login successful",
        token: `demo-token-${user.id}`,
        user
      });
    }

    /* =========================
       GET ALL PRODUCTS
    ========================= */

    if (
      req.method === "GET" &&
      pathname === "/api/products"
    ) {
      const q = url.searchParams
        .get("q")
        ?.toLowerCase() || "";

      let query = `
        SELECT
          products.id,
          products.product_code,
          products.name,
          products.price,
          products.stock,
          products.description,
          products.image,
          products.status,
          categories.name AS category
        FROM products
        LEFT JOIN categories
          ON products.category_id = categories.id
      `;

      let values = [];

      if (q) {
        query += `
          WHERE
            LOWER(products.name) LIKE ?
            OR LOWER(categories.name) LIKE ?
            OR LOWER(products.product_code) LIKE ?
        `;

        values = [
          `%${q}%`,
          `%${q}%`,
          `%${q}%`
        ];
      }

      query += `
        ORDER BY products.id DESC
      `;

      const [products] = await pool.query(
        query,
        values
      );

      return send(res, 200, products);
    }

    /* =========================
       GET ONE PRODUCT
    ========================= */

    const productMatch = pathname.match(
      /^\/api\/products\/(\d+)$/
    );

    if (
      req.method === "GET" &&
      productMatch
    ) {
      const productId = productMatch[1];

      const [products] = await pool.query(
        `
        SELECT
          products.*,
          categories.name AS category
        FROM products
        LEFT JOIN categories
          ON products.category_id = categories.id
        WHERE products.id = ?
        `,
        [productId]
      );

      if (products.length === 0) {
        return send(res, 404, {
          message: "Product not found"
        });
      }

      return send(res, 200, products[0]);
    }

    /* =========================
       ADD PRODUCT
    ========================= */

    if (
      req.method === "POST" &&
      pathname === "/api/products"
    ) {
      const body = await readBody(req);

      if (!body.name) {
        return send(res, 400, {
          message: "Product name is required"
        });
      }

      let categoryId = body.category_id;

      if (!categoryId && body.category) {
        const [categories] = await pool.query(
          `
          SELECT id
          FROM categories
          WHERE name = ?
          LIMIT 1
          `,
          [body.category]
        );

        if (categories.length > 0) {
          categoryId = categories[0].id;
        }
      }

      const [lastProduct] = await pool.query(
        `
        SELECT id
        FROM products
        ORDER BY id DESC
        LIMIT 1
        `
      );

      const nextNumber =
        lastProduct.length > 0
          ? Number(lastProduct[0].id) + 1
          : 1;

      const productCode =
        "P" +
        String(nextNumber).padStart(3, "0");

      const [result] = await pool.query(
        `
        INSERT INTO products
        (
          product_code,
          name,
          category_id,
          price,
          stock,
          description,
          image,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          productCode,
          body.name,
          categoryId || null,
          Number(body.price || 0),
          Number(body.stock || 0),
          body.description || "",
          body.image || "",
          body.status || "Active"
        ]
      );

      return send(res, 201, {
        message: "Product added successfully",
        productId: result.insertId
      });
    }

    /* =========================
       UPDATE PRODUCT
    ========================= */

    if (
      req.method === "PUT" &&
      productMatch
    ) {
      const productId = productMatch[1];
      const body = await readBody(req);

      let categoryId = body.category_id;

      if (!categoryId && body.category) {
        const [categories] = await pool.query(
          `
          SELECT id
          FROM categories
          WHERE name = ?
          LIMIT 1
          `,
          [body.category]
        );

        if (categories.length > 0) {
          categoryId = categories[0].id;
        }
      }

      const [result] = await pool.query(
        `
        UPDATE products
        SET
          name = ?,
          category_id = ?,
          price = ?,
          stock = ?,
          description = ?,
          image = ?,
          status = ?
        WHERE id = ?
        `,
        [
          body.name,
          categoryId || null,
          Number(body.price || 0),
          Number(body.stock || 0),
          body.description || "",
          body.image || "",
          body.status || "Active",
          productId
        ]
      );

      if (result.affectedRows === 0) {
        return send(res, 404, {
          message: "Product not found"
        });
      }

      return send(res, 200, {
        message: "Product updated successfully"
      });
    }

    /* =========================
       DELETE PRODUCT
    ========================= */

    if (
      req.method === "DELETE" &&
      productMatch
    ) {
      const productId = productMatch[1];

      const [result] = await pool.query(
        `
        DELETE FROM products
        WHERE id = ?
        `,
        [productId]
      );

      if (result.affectedRows === 0) {
        return send(res, 404, {
          message: "Product not found"
        });
      }

      return send(res, 200, {
        message: "Product deleted successfully"
      });
    }

    /* =========================
       GET CATEGORIES
    ========================= */

    if (
      req.method === "GET" &&
      pathname === "/api/categories"
    ) {
      const [categories] = await pool.query(
        `
        SELECT *
        FROM categories
        ORDER BY name ASC
        `
      );

      return send(res, 200, categories);
    }

    /* =========================
       GET CUSTOMERS
    ========================= */

    if (
      req.method === "GET" &&
      pathname === "/api/customers"
    ) {
      const [customers] = await pool.query(
        `
        SELECT *
        FROM customers
        ORDER BY id DESC
        `
      );

      return send(res, 200, customers);
    }

    /* =========================
       GET ORDERS
    ========================= */

    if (
      req.method === "GET" &&
      pathname === "/api/orders"
    ) {
      const [orders] = await pool.query(
        `
        SELECT
          orders.id,
          orders.order_number,
          orders.total,
          orders.status,
          orders.created_at,
          customers.name AS customer_name,
          customers.email AS customer_email,
          customers.phone AS customer_phone
        FROM orders
        LEFT JOIN customers
          ON orders.customer_id = customers.id
        ORDER BY orders.id DESC
        `
      );

      return send(res, 200, orders);
    }

    /* =========================
       CREATE ORDER
    ========================= */

    if (
      req.method === "POST" &&
      pathname === "/api/orders"
    ) {
      const body = await readBody(req);

      const customer = body.customer;
      const items = body.items;

      if (
        !customer ||
        !customer.name ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return send(res, 400, {
          message: "Customer and order items are required"
        });
      }

      const connection =
        await pool.getConnection();

      try {
        await connection.beginTransaction();

        let customerId;

        const [existingCustomers] =
          await connection.query(
            `
            SELECT id
            FROM customers
            WHERE email = ?
            LIMIT 1
            `,
            [customer.email || ""]
          );

        if (existingCustomers.length > 0) {
          customerId =
            existingCustomers[0].id;
        } else {
          const [customerResult] =
            await connection.query(
              `
              INSERT INTO customers
              (
                name,
                email,
                phone,
                address
              )
              VALUES (?, ?, ?, ?)
              `,
              [
                customer.name,
                customer.email || "",
                customer.phone || "",
                customer.address || ""
              ]
            );

          customerId =
            customerResult.insertId;
        }

        const total = items.reduce(
          (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
          0
        );

        const orderNumber =
          "ORD-" +
          Date.now();

        const [orderResult] =
          await connection.query(
            `
            INSERT INTO orders
            (
              order_number,
              customer_id,
              total,
              status
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              orderNumber,
              customerId,
              total,
              "Pending"
            ]
          );

        const orderId =
          orderResult.insertId;

        for (const item of items) {
          const subtotal =
            Number(item.price) *
            Number(item.quantity);

          await connection.query(
            `
            INSERT INTO order_items
            (
              order_id,
              product_id,
              quantity,
              price,
              subtotal
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              subtotal
            ]
          );

          await connection.query(
            `
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
            AND stock >= ?
            `,
            [
              item.quantity,
              item.product_id,
              item.quantity
            ]
          );
        }

        await connection.commit();

        return send(res, 201, {
          message: "Order created successfully",
          orderId,
          orderNumber,
          total
        });

      } catch (error) {
        await connection.rollback();
        throw error;

      } finally {
        connection.release();
      }
    }

    /* =========================
       DASHBOARD SUMMARY
    ========================= */

    if (
      req.method === "GET" &&
      pathname === "/api/dashboard/summary"
    ) {
      const [[productResult]] =
        await pool.query(
          `
          SELECT COUNT(*) AS totalProducts
          FROM products
          `
        );

      const [[customerResult]] =
        await pool.query(
          `
          SELECT COUNT(*) AS totalCustomers
          FROM customers
          `
        );

      const [[orderResult]] =
        await pool.query(
          `
          SELECT COUNT(*) AS totalOrders
          FROM orders
          `
        );

      const [[revenueResult]] =
        await pool.query(
          `
          SELECT
            COALESCE(SUM(total), 0)
            AS totalRevenue
          FROM orders
          WHERE status != 'Cancelled'
          `
        );

      return send(res, 200, {
        totalProducts:
          productResult.totalProducts,

        totalCustomers:
          customerResult.totalCustomers,

        totalOrders:
          orderResult.totalOrders,

        totalRevenue:
          revenueResult.totalRevenue
      });
    }

    /* =========================
       API NOT FOUND
    ========================= */

    return send(res, 404, {
      message: "API endpoint not found"
    });

  } catch (error) {
    console.error(error);

    return send(res, 500, {
      message:
        error.message ||
        "Server error"
    });
  }
});

/* =========================
   START SERVER
========================= */

server.listen(PORT, () => {
  console.log(
    `MEN'S Fashion Admin API running at http://localhost:${PORT}`
  );
});