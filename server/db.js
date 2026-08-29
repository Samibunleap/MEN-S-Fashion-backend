const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "data", "mens_fashion.db");
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'customer' CHECK(role IN ('admin','customer')),
      image TEXT DEFAULT '',
      username TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','blocked')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Clothing',
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL DEFAULT 'Customer',
      customer_email TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      items TEXT DEFAULT '[]',
      address TEXT DEFAULT '',
      total REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'ABA / Bank Transfer',
      payment_status TEXT DEFAULT 'PENDING_PAYMENT_REVIEW',
      order_status TEXT DEFAULT 'AWAITING_PAYMENT_CONFIRMATION',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (userCount === 0) {
    const adminHash = crypto.createHash("sha256").update("admin123").digest("hex");
    db.prepare(`INSERT INTO users (name, email, password, phone, role, username, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run("Admin", "admin@gmail.com", adminHash, "", "admin", "admin", "active");
  }

  const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
  if (catCount === 0) {
    const cats = [
      ["Clothing", "All clothing products"],
      ["Footwear", "Men's shoes and boots"],
      ["Accessories", "Fashion accessories"],
      ["Bags", "Bags and totes"],
      ["Jackets", "Outerwear and jackets"],
    ];
    const ins = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
    for (const [n, d] of cats) ins.run(n, d);
  }

  const settingsCount = db.prepare("SELECT COUNT(*) as c FROM settings").get().c;
  if (settingsCount === 0) {
    const defaults = [
      ["storeName", "MEN'S Fashion"],
      ["storeEmail", "store@fashion.com"],
      ["storePhone", "+855 12 345 678"],
      ["storeAddress", "Phnom Penh, Cambodia"],
      ["currency", "USD"],
      ["tax", "10"],
    ];
    const ins = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of defaults) ins.run(k, v);
  }

  const prodCount = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
  if (prodCount === 0) {
    const prods = [
      ["Leather Biker Jacket", "Clothing", 89, 20, "A sleek black leather biker jacket with an asymmetric zip.", "", 1],
      ["Smart Casual Blazer", "Clothing", 120, 15, "Impeccably tailored in a khaki mid-weight fabric.", "", 1],
      ["Technical Field Parka", "Clothing", 89, 25, "An olive wax-coated field jacket with zip-out hood.", "", 0],
      ["Half-Zip Knit Sweater", "Clothing", 50, 30, "A ribbed camel half-zip in extra-fine merino wool.", "", 1],
      ["Three-Piece Tweed Suit", "Clothing", 120, 10, "A blue windowpane three-piece in heritage tweed.", "", 0],
      ["Street Sweatshirt", "Clothing", 35, 40, "A relaxed French terry crew in dusty rose.", "", 0],
      ["Slim Chino Trouser", "Clothing", 35, 35, "A grey slim-cut chino in brushed cotton twill.", "", 0],
      ["Oxford Dress Shirt", "Clothing", 45, 28, "A classic Oxford cloth button-down.", "", 0],
      ["Monochrome Sneaker", "Footwear", 30, 50, "A sage-green tonal low-top with deconstructed panelling.", "", 1],
      ["White Leather Sneaker", "Footwear", 25, 60, "A clean white cup-sole sneaker.", "", 1],
      ["Brogue Derby Shoe", "Footwear", 29, 18, "A dark tan leather brogue with cap-toe stitching.", "", 0],
      ["Chelsea Boot", "Footwear", 25, 22, "A sleek Chelsea boot in smooth calfskin.", "", 0],
      ["Chronograph Watch", "Accessories", 25, 40, "A diver-inspired chronograph with a vivid blue dial.", "", 1],
      ["Minimalist Mesh Watch", "Accessories", 15, 35, "A slim 38mm stainless case on a fine mesh bracelet.", "", 0],
      ["Woven Leather Belt", "Accessories", 25, 45, "A hand-woven full-grain leather belt.", "", 0],
      ["Leather Bifold Wallet", "Accessories", 15, 55, "A slim bifold in full-grain vegetable-tanned leather.", "", 0],
      ["Merino Wool Scarf", "Accessories", 10, 30, "An extra-fine merino scarf in a herringbone weave.", "", 0],
      ["Canvas Tote Bag", "Accessories", 110, 12, "A waxed canvas tote with leather handles.", "", 1],
    ];
    const ins = db.prepare("INSERT INTO products (name, category, price, stock, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const p of prods) ins.run(...p);
  }

  console.log("Database initialized successfully.");
  return db;
}

module.exports = { getDb, initDatabase };
