const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { initDatabase, getPool } = require("./db_mysql");

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

const sessions = new Map();

function createSession(user) {
  const token = crypto.randomUUID();
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return token;
}

function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

function safeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : req.query.token;
}

async function getSessionUser(req) {
  const token = getToken(req);
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  const db = await getPool();
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [session.userId]);
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Session is invalid or expired" });
  req.user = user;
  next();
}

async function requireAdmin(req, res, next) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  req.user = user;
  next();
}

// ===================== PRODUCTS =====================
app.get("/api/products", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM products ORDER BY id DESC");
    const products = rows.map(p => ({
      ...p,
      featured: p.featured === 1,
      img: p.image || "",
      cat: p.category || "Clothing",
      tag: (p.category || "clothing").toLowerCase(),
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    const p = rows[0];
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json({ ...p, featured: p.featured === 1, img: p.image || "", cat: p.category || "Clothing" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const db = await getPool();
    const body = req.body || {};
    if (!body.name || !body.category || body.price === undefined || body.stock === undefined) {
      return res.status(400).json({ message: "Name, category, price and stock are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO products (name, category, price, stock, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        String(body.name),
        String(body.category).trim() || "Clothing",
        Number(body.price),
        Number(body.stock),
        body.description || "",
        body.image || "",
        body.featured ? 1 : 0,
      ]
    );
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json({ ...rows[0], featured: rows[0].featured === 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Product not found" });
    const body = req.body || {};
    const ex = existing[0];
    const name = body.name ?? ex.name;
    const category = body.category ?? ex.category;
    const price = body.price !== undefined ? Number(body.price) : ex.price;
    const stock = body.stock !== undefined ? Number(body.stock) : ex.stock;
    const description = body.description !== undefined ? body.description : ex.description;
    const image = body.image !== undefined ? body.image : ex.image;
    const featured = body.featured !== undefined ? (body.featured ? 1 : 0) : ex.featured;
    await db.execute(
      "UPDATE products SET name=?, category=?, price=?, stock=?, description=?, image=?, featured=? WHERE id=?",
      [name, category, price, stock, description, image, featured, req.params.id]
    );
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json({ ...rows[0], featured: rows[0].featured === 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Product not found" });
    await db.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== CATEGORIES =====================
app.get("/api/categories", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM categories ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const db = await getPool();
    const { name, description = "" } = req.body || {};
    if (!name) return res.status(400).json({ message: "Category name is required" });
    try {
      const [result] = await db.execute("INSERT INTO categories (name, description) VALUES (?, ?)", [String(name).trim(), description]);
      const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Category name already exists" });
      throw e;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Category not found" });
    const { name, description } = req.body || {};
    try {
      await db.execute("UPDATE categories SET name=?, description=? WHERE id=?", [name ?? existing[0].name, description ?? existing[0].description, req.params.id]);
      const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [req.params.id]);
      res.json(rows[0]);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Category name already exists" });
      throw e;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Category not found" });
    await db.execute("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== AUTH =====================
app.post("/api/auth/register", async (req, res) => {
  try {
    const db = await getPool();
    const { name, email, password, phone = "" } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    const [exists] = await db.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", [email]);
    if (exists[0]) return res.status(409).json({ message: "Email already registered" });
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, phone, role, username, status) VALUES (?, ?, ?, ?, 'customer', '', 'active')",
      [name, email, hashPassword(password), phone]
    );
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
    const token = createSession(rows[0]);
    res.status(201).json({ user: safeUser(rows[0]), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email]);
    const user = rows[0];
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.status === "blocked") return res.status(403).json({ message: "Account has been blocked" });
    const token = createSession(user);
    res.json({ user: safeUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ message: "Session is invalid or expired" });
    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const token = getToken(req);
  if (token) sessions.delete(token);
  res.json({ message: "Logged out" });
});

app.put("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = rows[0];
    if (user.password !== hashPassword(currentPassword)) return res.status(401).json({ message: "Current password is incorrect" });
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashPassword(newPassword), req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== ADMIN PROFILE =====================
app.get("/api/admin/profile", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (!rows[0]) return res.status(404).json({ message: "Admin account not found" });
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/profile", async (req, res) => {
  try {
    const db = await getPool();
    const [adminRows] = await db.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    const admin = adminRows[0];
    if (!admin) return res.status(404).json({ message: "Admin account not found" });
    const body = req.body || {};
    if (body.email && body.email !== admin.email) {
      const [dup] = await db.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?", [body.email, admin.id]);
      if (dup[0]) return res.status(409).json({ message: "Email is already in use" });
    }
    const name = body.fullName ?? body.name ?? admin.name;
    const username = body.username ?? admin.username ?? "admin";
    const email = body.email ?? admin.email;
    const phone = body.phone ?? admin.phone ?? "";
    const image = body.image ?? admin.image ?? "";
    await db.execute("UPDATE users SET name=?, username=?, email=?, phone=?, image=? WHERE id=?", [name, username, email, phone, image, admin.id]);
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [admin.id]);
    res.json({ message: "Profile updated successfully!", user: safeUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== CUSTOMERS =====================
app.get("/api/customers", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM users WHERE role = 'customer' ORDER BY id DESC");
    const customers = [];
    for (const u of rows) {
      const [orderCount] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE customer_email = ?", [u.email]);
      customers.push({ ...safeUser(u), totalOrders: orderCount[0].c, orderCount: orderCount[0].c });
    }
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ? AND role = 'customer'", [req.params.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "Customer not found" });
    const [orders] = await db.execute("SELECT * FROM orders WHERE customer_email = ? ORDER BY id DESC", [user.email]);
    const parsedOrders = orders.map(o => ({ ...o, items: (() => { try { return JSON.parse(o.items); } catch { return []; } })() }));
    const totalSpent = parsedOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    res.json({ ...safeUser(user), totalOrders: parsedOrders.length, totalSpent, orders: parsedOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM users WHERE id = ? AND role = 'customer'", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Customer not found" });
    const body = req.body || {};
    if (body.email && body.email !== existing[0].email) {
      const [dup] = await db.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?", [body.email, req.params.id]);
      if (dup[0]) return res.status(409).json({ message: "Email is already in use" });
    }
    await db.execute("UPDATE users SET name=?, email=?, phone=?, status=? WHERE id=?",
      [body.name ?? existing[0].name, body.email ?? existing[0].email, body.phone ?? existing[0].phone, body.status ?? existing[0].status, req.params.id]);
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [req.params.id]);
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM users WHERE id = ? AND role = 'customer'", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Customer not found" });
    await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== ORDERS =====================
app.get("/api/orders", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM orders ORDER BY id DESC");
    const orders = rows.map(o => ({
      ...o,
      items: (() => { try { return JSON.parse(o.items); } catch { return []; } })(),
    }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    const o = rows[0];
    if (!o) return res.status(404).json({ message: "Order not found" });
    o.items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
    res.json(o);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const db = await getPool();
    const body = req.body || {};
    const items = body.items || [];
    const [result] = await db.execute(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, items, address, total, payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT_REVIEW', 'AWAITING_PAYMENT_CONFIRMATION')`,
      [
        body.customerName || body.customer || "Customer",
        body.customerEmail || "",
        body.customerPhone || body.phone || "",
        JSON.stringify(items),
        body.address || "",
        Number(body.total || 0),
        body.paymentMethod || body.payment || "ABA / Bank Transfer",
      ]
    );
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [result.insertId]);
    rows[0].items = (() => { try { return JSON.parse(rows[0].items); } catch { return []; } })();
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/orders/:id/payment/accept", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Order not found" });
    await db.execute("UPDATE orders SET payment_status = 'PAYMENT_CONFIRMED', order_status = 'PAYMENT_CONFIRMED' WHERE id = ?", [req.params.id]);
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    rows[0].items = (() => { try { return JSON.parse(rows[0].items); } catch { return []; } })();
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/orders/:id/payment/reject", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Order not found" });
    await db.execute("UPDATE orders SET payment_status = 'PAYMENT_REJECTED', order_status = 'CANCELLED' WHERE id = ?", [req.params.id]);
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    rows[0].items = (() => { try { return JSON.parse(rows[0].items); } catch { return []; } })();
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const allowed = ["PREPARING", "READY_TO_SHIP", "SHIPPING", "DELIVERED", "CANCELLED"];
    const status = req.body.status;
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid order status" });
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Order not found" });
    if (status !== "CANCELLED" && existing[0].payment_status !== "PAYMENT_CONFIRMED") {
      return res.status(400).json({ message: "Accept payment before processing this order" });
    }
    await db.execute("UPDATE orders SET order_status = ? WHERE id = ?", [status, req.params.id]);
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    rows[0].items = (() => { try { return JSON.parse(rows[0].items); } catch { return []; } })();
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const db = await getPool();
    const [existing] = await db.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: "Order not found" });
    await db.execute("DELETE FROM orders WHERE id = ?", [req.params.id]);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== SETTINGS =====================
app.get("/api/settings", async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute("SELECT * FROM settings");
    const obj = {};
    for (const r of rows) obj[r.setting_key] = r.setting_value;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const db = await getPool();
    const body = req.body || {};
    for (const [key, value] of Object.entries(body)) {
      await db.execute(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, String(value), String(value)]
      );
    }
    res.json({ message: "Settings saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== DASHBOARD =====================
app.get("/api/dashboard", async (req, res) => {
  try {
    const db = await getPool();
    const [totalProducts] = await db.execute("SELECT COUNT(*) as c FROM products");
    const [totalCustomers] = await db.execute("SELECT COUNT(*) as c FROM users WHERE role = 'customer'");
    const [totalOrders] = await db.execute("SELECT COUNT(*) as c FROM orders");
    const [pending] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE payment_status = 'PENDING_PAYMENT_REVIEW'");
    const [rev] = await db.execute("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE payment_status = 'PAYMENT_CONFIRMED' OR order_status = 'DELIVERED'");
    const [delivered] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE order_status = 'DELIVERED'");
    const [preparing] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE order_status = 'PREPARING'");
    const [shipping] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE order_status = 'SHIPPING' OR order_status = 'READY_TO_SHIP'");
    const [cancelled] = await db.execute("SELECT COUNT(*) as c FROM orders WHERE order_status = 'CANCELLED'");
    const [lowStock] = await db.execute("SELECT * FROM products WHERE stock <= 5 AND stock > 0 ORDER BY stock ASC LIMIT 10");
    const [recentOrders] = await db.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 10");
    const [topProducts] = await db.execute("SELECT * FROM products ORDER BY id DESC LIMIT 5");

    const salesData = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 30);
      const month = d.toLocaleString("en", { month: "short" });
      salesData.push({ month, sales: Math.floor(Math.random() * 5000) + 2000 });
    }

    res.json({
      totalProducts: totalProducts[0].c,
      totalCustomers: totalCustomers[0].c,
      totalOrders: totalOrders[0].c,
      pendingPaymentReview: pending[0].c,
      revenue: rev[0].s,
      delivered: delivered[0].c,
      preparing: preparing[0].c,
      shipping: shipping[0].c,
      cancelled: cancelled[0].c,
      lowStockProducts: lowStock,
      recentOrders: recentOrders.map(o => ({ ...o, items: (() => { try { return JSON.parse(o.items); } catch { return []; } })() })),
      topProducts,
      salesData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== START SERVER =====================
async function start() {
  try {
    await initDatabase();
    app.listen(8080, () => console.log("MEN'S Fashion backend (MySQL) running on http://localhost:8080"));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    console.error("\nMake sure MySQL is running and update DB_CONFIG in db_mysql.js with your credentials.");
    process.exit(1);
  }
}

start();
