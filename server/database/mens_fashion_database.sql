-- =============================================================
-- MEN'S FASHION - MySQL Database Setup
-- Database: mens_fashion
-- Compatible with MySQL 8.x
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS mens_fashion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mens_fashion;

-- Optional clean reinstall. Uncomment only when you want to erase all data.
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS contact_messages;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS categories; 
-- DROP TABLE IF EXISTS settings;
-- DROP TABLE IF EXISTS users;

-- =============================================================
-- USERS
-- Stores administrators and customers.
-- Password values are SHA-256 hashes to match the current Node backend.
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  image LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CATEGORIES
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PRODUCTS
-- The application currently stores uploaded images as paths or Base64 data.
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'Clothing',
  price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  description TEXT NULL,
  image LONGTEXT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_featured (featured),
  KEY idx_products_stock (stock),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ORDERS
-- The items JSON column is retained for compatibility with server_mysql.js.
-- order_items provides a normalized item history for future use.
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(150) NOT NULL DEFAULT 'Customer',
  customer_email VARCHAR(191) NOT NULL DEFAULT '',
  customer_phone VARCHAR(50) NOT NULL DEFAULT '',
  items JSON NULL,
  address TEXT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'ABA / Bank Transfer',
  payment_status ENUM(
    'PENDING_PAYMENT_REVIEW',
    'PAYMENT_CONFIRMED',
    'PAYMENT_REJECTED'
  ) NOT NULL DEFAULT 'PENDING_PAYMENT_REVIEW',
  order_status ENUM(
    'AWAITING_PAYMENT_CONFIRMATION',
    'PAYMENT_CONFIRMED',
    'PREPARING',
    'READY_TO_SHIP',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'AWAITING_PAYMENT_CONFIRMATION',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_customer_email (customer_email),
  KEY idx_orders_payment_status (payment_status),
  KEY idx_orders_order_status (order_status),
  KEY idx_orders_created_at (created_at),
  CONSTRAINT chk_orders_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ORDER ITEMS
-- Product references use ON DELETE SET NULL so order history is preserved.
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image LONGTEXT NULL,
  size VARCHAR(30) NOT NULL DEFAULT 'M',
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CONTACT MESSAGES
-- Managed by the Admin Messages page.
-- =============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  subject VARCHAR(255) NOT NULL DEFAULT 'General Enquiry',
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_messages_status (status),
  KEY idx_contact_messages_email (email),
  KEY idx_contact_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SETTINGS
-- Key/value settings used by the admin settings API.
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(150) NOT NULL,
  setting_value LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- DEFAULT ADMIN
-- Test login: admin@gmail.com / admin123
-- Change this password immediately outside a classroom/demo environment.
-- =============================================================
INSERT INTO users
  (name, username, email, password, phone, role, status)
VALUES
  ('Administrator', 'admin', 'admin@gmail.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '', 'admin', 'active')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  username = VALUES(username),
  role = 'admin',
  status = 'active';

-- =============================================================
-- DEFAULT CATEGORIES
-- =============================================================
INSERT INTO categories (name, description) VALUES
  ('Clothing', 'Modern clothing and everyday menswear.'),
  ('Jackets', 'Jackets, blazers, coats and outerwear.'),
  ('Footwear', 'Shoes, sneakers and formal footwear.'),
  ('Accessories', 'Watches, belts and other accessories.'),
  ('Bags', 'Tote bags, backpacks and travel bags.')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

-- =============================================================
-- DEFAULT SETTINGS
-- =============================================================
INSERT INTO settings (setting_key, setting_value) VALUES
  ('store_name', 'MEN''S Fashion'),
  ('store_email', 'mensfashion@gmail.com'),
  ('store_phone', '+855 962702059'),
  ('currency', 'USD'),
  ('order_notification', 'true'),
  ('message_notification', 'true'),
  ('customer_notification', 'true'),
  ('low_stock_alert', 'true'),
  ('promotion_notification', 'false')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================
SHOW TABLES;
SELECT id, name, username, email, role, status, created_at FROM users;
SELECT id, name, description FROM categories ORDER BY id;
SELECT setting_key, setting_value FROM settings ORDER BY setting_key;
