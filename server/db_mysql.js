const path = require("path");
const crypto = require("crypto");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});

const mysql = require("mysql2/promise");

let pool = null;

// ============================================
// MYSQL CONFIGURATION
// ============================================

const DB_CONFIG = {
  host:
    process.env.DB_HOST ||
    "localhost",

  port: Number(
    process.env.DB_PORT ||
      3306
  ),

  user:
    process.env.DB_USER ||
    "fashion",

  password:
    process.env.DB_PASSWORD ||
    "fashion123",

  database:
    process.env.DB_NAME ||
    "mens_fashion",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
};

// ============================================
// GET CONNECTION POOL
// ============================================

function getPool() {
  if (!pool) {
    pool = mysql.createPool(
      DB_CONFIG
    );

    console.log(
      "MySQL pool created."
    );

    console.log(
      `Database: ${DB_CONFIG.database}`
    );
  }

  return pool;
}

// ============================================
// CREATE DATABASE
// ============================================

async function createDatabase() {
  const connection =
    await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      charset: "utf8mb4",
    });

  try {
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS
       \`${DB_CONFIG.database}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );

    console.log(
      `Database "${DB_CONFIG.database}" ready.`
    );
  } finally {
    await connection.end();
  }
}

// ============================================
// USERS TABLE
// ============================================

async function createUsersTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT
        NOT NULL AUTO_INCREMENT,

      name VARCHAR(255)
        NOT NULL,

      email VARCHAR(255)
        NOT NULL,

      password VARCHAR(255)
        NOT NULL,

      phone VARCHAR(50)
        NOT NULL DEFAULT '',

      role ENUM(
        'admin',
        'customer'
      ) NOT NULL DEFAULT 'customer',

      image LONGTEXT
        NULL,

      username VARCHAR(100)
        NULL,

      status ENUM(
        'active',
        'blocked'
      ) NOT NULL DEFAULT 'active',

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      UNIQUE KEY unique_users_email (
        email
      ),

      INDEX idx_users_role (
        role
      ),

      INDEX idx_users_status (
        status
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Users table ready."
  );
}

// ============================================
// CATEGORIES TABLE
// ============================================

async function createCategoriesTable(
  db
) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT
        NOT NULL AUTO_INCREMENT,

      name VARCHAR(255)
        NOT NULL,

      description TEXT
        NULL,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      UNIQUE KEY unique_categories_name (
        name
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Categories table ready."
  );
}

// ============================================
// PRODUCTS TABLE
// ============================================

async function createProductsTable(
  db
) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT
        NOT NULL AUTO_INCREMENT,

      name VARCHAR(255)
        NOT NULL,

      category VARCHAR(255)
        NOT NULL DEFAULT 'Clothing',

      price DECIMAL(10, 2)
        NOT NULL DEFAULT 0,

      stock INT
        NOT NULL DEFAULT 0,

      description TEXT
        NULL,

      image LONGTEXT
        NULL,

      featured TINYINT(1)
        NOT NULL DEFAULT 0,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_products_category (
        category
      ),

      INDEX idx_products_featured (
        featured
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Products table ready."
  );
}

// ============================================
// ORDERS TABLE
// ============================================

async function createOrdersTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT
        NOT NULL AUTO_INCREMENT,

      customer_name VARCHAR(255)
        NOT NULL DEFAULT 'Customer',

      customer_email VARCHAR(255)
        NOT NULL DEFAULT '',

      customer_phone VARCHAR(50)
        NOT NULL DEFAULT '',

      items JSON
        NULL,

      address TEXT
        NULL,

      total DECIMAL(10, 2)
        NOT NULL DEFAULT 0,

      payment_method VARCHAR(100)
        NOT NULL DEFAULT 'ABA / Bank Transfer',

      payment_status ENUM(
        'PENDING_PAYMENT_REVIEW',
        'PAYMENT_CONFIRMED',
        'PAYMENT_REJECTED'
      )
        NOT NULL
        DEFAULT 'PENDING_PAYMENT_REVIEW',

      order_status ENUM(
        'AWAITING_PAYMENT_CONFIRMATION',
        'PAYMENT_CONFIRMED',
        'PREPARING',
        'READY_TO_SHIP',
        'SHIPPING',
        'DELIVERED',
        'CANCELLED'
      )
        NOT NULL
        DEFAULT 'AWAITING_PAYMENT_CONFIRMATION',

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_orders_email (
        customer_email
      ),

      INDEX idx_orders_payment (
        payment_status
      ),

      INDEX idx_orders_status (
        order_status
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Orders table ready."
  );
}

// ============================================
// ORDER ITEMS TABLE
// All foreign-key columns use signed INT
// ============================================

async function createOrderItemsTable(
  db
) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT
        NOT NULL AUTO_INCREMENT,

      order_id INT
        NOT NULL,

      product_id INT
        NULL,

      product_name VARCHAR(255)
        NOT NULL,

      product_image LONGTEXT
        NULL,

      product_details VARCHAR(255)
        NULL,

      quantity INT
        NOT NULL DEFAULT 1,

      unit_price DECIMAL(10, 2)
        NOT NULL DEFAULT 0,

      subtotal DECIMAL(10, 2)
        NOT NULL DEFAULT 0,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_order_items_order (
        order_id
      ),

      INDEX idx_order_items_product (
        product_id
      ),

      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

      CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Order items table ready."
  );
}

// ============================================
// CONTACT MESSAGES TABLE
// ============================================

async function createContactMessagesTable(
  db
) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT
        NOT NULL AUTO_INCREMENT,

      name VARCHAR(255)
        NOT NULL,

      email VARCHAR(255)
        NOT NULL,

      phone VARCHAR(50)
        NOT NULL DEFAULT '',

      subject VARCHAR(255)
        NOT NULL DEFAULT 'General Enquiry',

      message TEXT
        NOT NULL,

      status ENUM(
        'new',
        'read',
        'replied',
        'archived'
      ) NOT NULL DEFAULT 'new',

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      INDEX idx_messages_email (
        email
      ),

      INDEX idx_messages_status (
        status
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Contact messages table ready."
  );
}

// ============================================
// SETTINGS TABLE
// ============================================

async function createSettingsTable(
  db
) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(100)
        NOT NULL,

      setting_value TEXT
        NULL,

      updated_at TIMESTAMP
        NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (
        setting_key
      )
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

  console.log(
    "Settings table ready."
  );
}

// ============================================
// CREATE OR RESET ADMIN
// Email: admin@gmail.com
// Password: admin123
// Password method: SHA-256
// ============================================

async function createAdmin(db) {
  const adminEmail =
    String(
      process.env.ADMIN_EMAIL ||
        "admin@gmail.com"
    )
      .trim()
      .toLowerCase();

  const adminPassword =
    String(
      process.env.ADMIN_PASSWORD ||
        "admin123"
    );

  const passwordHash = crypto
    .createHash("sha256")
    .update(adminPassword)
    .digest("hex");

  await db.execute(
    `INSERT INTO users (
       name,
       email,
       password,
       phone,
       role,
       image,
       username,
       status
     )
     VALUES (
       'Admin',
       ?,
       ?,
       '',
       'admin',
       '',
       'admin',
       'active'
     )
     ON DUPLICATE KEY UPDATE
       name = 'Admin',
       password = ?,
       phone = '',
       role = 'admin',
       username = 'admin',
       status = 'active'`,
    [
      adminEmail,
      passwordHash,
      passwordHash,
    ]
  );

  console.log(
    "Admin account ready."
  );

  console.log(
    `Admin email: ${adminEmail}`
  );

  console.log(
    `Admin password: ${adminPassword}`
  );
}

// ============================================
// DEFAULT CATEGORIES
// ============================================

async function seedCategories(db) {
  const categories = [
    [
      "Clothing",
      "All clothing products",
    ],
    [
      "Footwear",
      "Men's shoes and boots",
    ],
    [
      "Accessories",
      "Fashion accessories",
    ],
    [
      "Bags",
      "Bags and totes",
    ],
    [
      "Jackets",
      "Outerwear and jackets",
    ],
  ];

  for (const [
    name,
    description,
  ] of categories) {
    await db.execute(
      `INSERT INTO categories (
         name,
         description
       )
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         description = ?`,
      [
        name,
        description,
        description,
      ]
    );
  }

  console.log(
    "Default categories ready."
  );
}

// ============================================
// DEFAULT SETTINGS
// ============================================

async function seedSettings(db) {
  const settings = [
    [
      "storeName",
      "MEN'S Fashion",
    ],
    [
      "storeEmail",
      "store@fashion.com",
    ],
    [
      "storePhone",
      "+855 12 345 678",
    ],
    [
      "storeAddress",
      "Phnom Penh, Cambodia",
    ],
    [
      "currency",
      "USD",
    ],
    [
      "tax",
      "10",
    ],
  ];

  for (const [
    key,
    value,
  ] of settings) {
    await db.execute(
      `INSERT INTO settings (
         setting_key,
         setting_value
       )
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         setting_value = ?`,
      [
        key,
        value,
        value,
      ]
    );
  }

  console.log(
    "Default settings ready."
  );
}

// ============================================
// INITIALIZE DATABASE
// ============================================

async function initDatabase() {
  try {
    console.log(
      "Initializing MySQL database..."
    );

    await createDatabase();

    const db = getPool();

    await createUsersTable(db);
    await createCategoriesTable(db);
    await createProductsTable(db);
    await createOrdersTable(db);

    await createOrderItemsTable(
      db
    );

    await createContactMessagesTable(
      db
    );

    await createSettingsTable(db);

    await createAdmin(db);
    await seedCategories(db);
    await seedSettings(db);

    console.log(
      "Database initialization complete."
    );

    return db;
  } catch (error) {
    console.error(
      "Database initialization failed:",
      error.message
    );

    throw error;
  }
}

// ============================================
// TEST CONNECTION
// ============================================

async function testConnection() {
  const db = getPool();

  const [rows] =
    await db.execute(`
      SELECT
        CURRENT_USER()
          AS currentUser,

        DATABASE()
          AS databaseName
    `);

  return rows[0];
}

// ============================================
// CLOSE CONNECTION POOL
// ============================================

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;

    console.log(
      "MySQL pool closed."
    );
  }
}

module.exports = {
  DB_CONFIG,
  getPool,
  initDatabase,
  testConnection,
  closePool,
};