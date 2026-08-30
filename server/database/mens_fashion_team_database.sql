-- =============================================================
-- MEN'S FASHION TEAM DATABASE
-- MySQL 8.x
-- Import this file into a NEW local MySQL installation.
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS mens_fashion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mens_fashion;

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

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_products_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(150) NOT NULL DEFAULT 'Customer',
  customer_email VARCHAR(191) NOT NULL DEFAULT '',
  customer_phone VARCHAR(50) NOT NULL DEFAULT '',
  items JSON NULL,
  address TEXT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'ABA / Bank Transfer',
  payment_status ENUM('PENDING_PAYMENT_REVIEW','PAYMENT_CONFIRMED','PAYMENT_REJECTED') NOT NULL DEFAULT 'PENDING_PAYMENT_REVIEW',
  order_status ENUM('AWAITING_PAYMENT_CONFIRMATION','PAYMENT_CONFIRMED','PREPARING','READY_TO_SHIP','SHIPPING','DELIVERED','CANCELLED') NOT NULL DEFAULT 'AWAITING_PAYMENT_CONFIRMATION',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_customer_email (customer_email),
  KEY idx_orders_payment_status (payment_status),
  KEY idx_orders_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_contact_messages_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(150) NOT NULL,
  setting_value LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin login: admin@gmail.com / admin123
INSERT INTO users (name, username, email, password, phone, role, status)
VALUES ('Administrator', 'admin', 'admin@gmail.com', SHA2('admin123', 256), '+855 962702059', 'admin', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), username=VALUES(username), role='admin', status='active';

-- Demo customer login password: customer123
INSERT INTO users (name, username, email, password, phone, role, status) VALUES
('Sami Customer', '', 'sami.customer@example.com', SHA2('customer123', 256), '+855 10111222', 'customer', 'active'),
('Dara Customer', '', 'dara.customer@example.com', SHA2('customer123', 256), '+855 12131415', 'customer', 'active'),
('Sokha Customer', '', 'sokha.customer@example.com', SHA2('customer123', 256), '+855 16171819', 'customer', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), status=VALUES(status);

INSERT INTO categories (name, description) VALUES
('Clothing', 'Modern clothing and everyday menswear.'),
('Jackets', 'Jackets, blazers, coats and outerwear.'),
('Footwear', 'Shoes, sneakers and formal footwear.'),
('Accessories', 'Watches, belts and other accessories.'),
('Bags', 'Tote bags, backpacks and travel bags.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert the 18 demo products only when the products table is empty.
INSERT INTO products (name, category, price, stock, description, image, featured)
SELECT * FROM (
  SELECT 'Leather Biker Jacket','Jackets',89.99,20,'Premium leather biker jacket with a modern fitted design.','/image/Leather Biker Jacket.png',1 UNION ALL
  SELECT 'Smart Casual Blazer','Jackets',79.99,15,'Smart blazer for meetings and special occasions.','/image/Smart Casual Blazer.png',1 UNION ALL
  SELECT 'Technical Field Parka','Jackets',95.00,25,'Weather-resistant parka with practical storage pockets.','/image/Technical Field Parka.png',1 UNION ALL
  SELECT 'Half-Zip Knit Sweater','Clothing',49.99,30,'Soft knit sweater for everyday comfort.','/image/Half-Zip Knit Sweater.jpg',1 UNION ALL
  SELECT 'Three-Piece Tweed Suit','Clothing',149.99,10,'Classic tailored three-piece tweed suit.','/image/Three-Piece Tweed Suit.png',1 UNION ALL
  SELECT 'Classic Oxford Shirt','Clothing',35.00,40,'Classic versatile Oxford shirt.','/image/Classic Oxford Shirt.png',1 UNION ALL
  SELECT 'Premium Cotton T-Shirt','Clothing',25.00,55,'Premium cotton T-shirt for everyday wear.','/image/Premium Cotton T-Shirt.png',0 UNION ALL
  SELECT 'Slim Fit Chino Trousers','Clothing',42.50,32,'Modern slim-fit chino trousers.','/image/Slim Fit Chino Trousers.png',0 UNION ALL
  SELECT 'Relaxed Linen Shirt','Clothing',39.99,28,'Lightweight linen shirt for warm weather.','/image/Relaxed Linen Shirt.png',0 UNION ALL
  SELECT 'Wool Overcoat','Jackets',120.00,12,'Warm wool overcoat with a refined silhouette.','/image/Wool Overcoat.png',1 UNION ALL
  SELECT 'White Leather Sneaker','Footwear',59.99,35,'Minimal white leather sneakers.','/image/White Leather Sneaker.png',1 UNION ALL
  SELECT 'Brown Leather Loafer','Footwear',69.99,22,'Brown leather loafers with a polished design.','/image/Brown Leather Loafer.png',0 UNION ALL
  SELECT 'Black Chelsea Boot','Footwear',84.99,18,'Black Chelsea boots with a durable sole.','/image/Black Chelsea Boot.png',0 UNION ALL
  SELECT 'Chronograph Watch','Accessories',110.00,14,'Elegant modern chronograph watch.','/image/Chronograph Watch.png',1 UNION ALL
  SELECT 'Leather Belt','Accessories',29.99,45,'Classic leather belt with metal buckle.','/image/Leather Belt.png',0 UNION ALL
  SELECT 'Classic Sunglasses','Accessories',24.99,38,'Classic sunglasses with UV protection.','/image/Classic Sunglasses.png',0 UNION ALL
  SELECT 'Canvas Tote Bag','Bags',34.99,26,'Durable canvas tote bag for everyday use.','/image/Canvas Tote Bag.png',1 UNION ALL
  SELECT 'Leather Backpack','Bags',74.99,16,'Spacious leather backpack with multiple compartments.','/image/Leather Backpack.png',0
) AS demo(name, category, price, stock, description, image, featured)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO contact_messages (name, email, phone, subject, message, status)
SELECT 'Sami Customer','sami.customer@example.com','+855 10111222','Product Size Question','Is the Smart Casual Blazer available in size L?','new'
WHERE NOT EXISTS (SELECT 1 FROM contact_messages LIMIT 1);

INSERT INTO orders (customer_name, customer_email, customer_phone, items, address, total, payment_method, payment_status, order_status)
SELECT 'Sami Customer','sami.customer@example.com','+855 10111222',
       JSON_ARRAY(JSON_OBJECT('name','Smart Casual Blazer','qty',1,'details','Size: M','unitPrice',79.99,'img','/image/Smart Casual Blazer.png')),
       'Phnom Penh, Cambodia',79.99,'ABA / Bank Transfer','PENDING_PAYMENT_REVIEW','AWAITING_PAYMENT_CONFIRMATION'
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

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
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SHOW TABLES;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_messages FROM contact_messages;
SELECT id, name, category, price, stock, featured FROM products ORDER BY id;
