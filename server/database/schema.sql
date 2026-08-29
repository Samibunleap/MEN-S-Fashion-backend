-- ============================================
-- MEN'S Fashion Database Schema for MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS mens_fashion;
USE mens_fashion;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    role ENUM('admin', 'customer') DEFAULT 'customer',
    image TEXT DEFAULT '',
    username VARCHAR(100) DEFAULT '',
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL DEFAULT 'Clothing',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    image LONGTEXT DEFAULT '',
    featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Customer',
    customer_email VARCHAR(255) DEFAULT '',
    customer_phone VARCHAR(50) DEFAULT '',
    items JSON DEFAULT NULL,
    address TEXT DEFAULT '',
    total DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(100) DEFAULT 'ABA / Bank Transfer',
    payment_status ENUM('PENDING_PAYMENT_REVIEW', 'PAYMENT_CONFIRMED', 'PAYMENT_REJECTED') DEFAULT 'PENDING_PAYMENT_REVIEW',
    order_status ENUM('AWAITING_PAYMENT_CONFIRMATION', 'PAYMENT_CONFIRMED', 'PREPARING', 'READY_TO_SHIP', 'SHIPPING', 'DELIVERED', 'CANCELLED') DEFAULT 'AWAITING_PAYMENT_CONFIRMATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_status (order_status),
    INDEX idx_customer_email (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
