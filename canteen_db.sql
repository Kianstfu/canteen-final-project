-- canteen_db.sql
-- I-import ito sa phpMyAdmin (XAMPP) para magawa ang database at mga tables.
-- Paano: buksan ang XAMPP Control Panel > Start ang Apache at MySQL >
-- pumunta sa http://localhost/phpmyadmin > New > pangalanan mo "canteen_db" > Import > piliin ang file na ito.

CREATE DATABASE IF NOT EXISTS canteen_db;
USE canteen_db;

CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NULL UNIQUE,
  password VARCHAR(255) NULL,
  full_name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  description VARCHAR(255),
  image_url VARCHAR(255),
  is_available TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NULL,
  customer_name VARCHAR(100) NOT NULL,
  building VARCHAR(100) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  contact_number VARCHAR(20),
  notes VARCHAR(255),
  payment_method VARCHAR(50) NOT NULL,
  total_amount DECIMAL(8,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  date_placed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  followed_up TINYINT(1) NOT NULL DEFAULT 0,
  rating INT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  price_at_order DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- Sample admin account para makapag-test agad (username: admin / password: admin123)
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');
