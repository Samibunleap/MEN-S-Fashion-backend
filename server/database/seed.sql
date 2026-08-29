-- ============================================
-- MEN'S Fashion Seed Data for MySQL
-- ============================================

USE mens_fashion;

-- ============================================
-- ADMIN USER (password: admin123)
-- SHA-256 hash of "admin123"
-- ============================================
INSERT INTO users (name, email, password, phone, role, username, status) VALUES
('Admin', 'admin@gmail.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '', 'admin', 'admin', 'active');

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, description) VALUES
('Clothing', 'All clothing products'),
('Footwear', 'Men''s shoes and boots'),
('Accessories', 'Fashion accessories'),
('Bags', 'Bags and totes'),
('Jackets', 'Outerwear and jackets');

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (name, category, price, stock, description, image, featured) VALUES
-- Clothing
('Leather Biker Jacket', 'Clothing', 89.00, 20, 'A sleek black leather biker jacket with an asymmetric zip and snap lapels.', '', 1),
('Smart Casual Blazer', 'Clothing', 120.00, 15, 'Impeccably tailored in a khaki mid-weight fabric.', '', 1),
('Technical Field Parka', 'Clothing', 89.00, 25, 'An olive wax-coated field jacket with zip-out hood.', '', 0),
('Half-Zip Knit Sweater', 'Clothing', 50.00, 30, 'A ribbed camel half-zip in extra-fine merino wool.', '', 1),
('Three-Piece Tweed Suit', 'Clothing', 120.00, 10, 'A blue windowpane three-piece in heritage tweed.', '', 0),
('Street Sweatshirt', 'Clothing', 35.00, 40, 'A relaxed French terry crew in dusty rose.', '', 0),
('Slim Chino Trouser', 'Clothing', 35.00, 35, 'A grey slim-cut chino in brushed cotton twill.', '', 0),
('Oxford Dress Shirt', 'Clothing', 45.00, 28, 'A classic Oxford cloth button-down in a subtle print.', '', 0),

-- Footwear
('Monochrome Sneaker', 'Footwear', 30.00, 50, 'A sage-green tonal low-top with deconstructed panelling.', '', 1),
('White Leather Sneaker', 'Footwear', 25.00, 60, 'A clean white cup-sole sneaker with a premium leather upper.', '', 1),
('Brogue Derby Shoe', 'Footwear', 29.00, 18, 'A dark tan leather brogue with cap-toe stitching.', '', 0),
('Chelsea Boot', 'Footwear', 25.00, 22, 'A sleek Chelsea boot in smooth calfskin.', '', 0),

-- Accessories
('Chronograph Watch', 'Accessories', 25.00, 40, 'A diver-inspired chronograph with a vivid blue dial.', '', 1),
('Minimalist Mesh Watch', 'Accessories', 15.00, 35, 'A slim 38mm stainless case on a fine mesh bracelet.', '', 0),
('Woven Leather Belt', 'Accessories', 25.00, 45, 'A hand-woven full-grain leather belt.', '', 0),
('Leather Bifold Wallet', 'Accessories', 15.00, 55, 'A slim bifold in full-grain vegetable-tanned leather.', '', 0),
('Merino Wool Scarf', 'Accessories', 10.00, 30, 'An extra-fine merino scarf in a herringbone weave.', '', 0),
('Canvas Tote Bag', 'Accessories', 110.00, 12, 'A waxed canvas tote with leather handles.', '', 1);

-- ============================================
-- SETTINGS
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES
('storeName', 'MEN''S Fashion'),
('storeEmail', 'store@fashion.com'),
('storePhone', '+855 12 345 678'),
('storeAddress', 'Phnom Penh, Cambodia'),
('currency', 'USD'),
('tax', '10');
