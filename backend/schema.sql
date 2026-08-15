-- fourClover ERP CRM - PostgreSQL Schema
-- Database initialization for PostgreSQL (e.g. Render PostgreSQL)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    business_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    customer_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Lead',
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    warehouse_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_changed INT NOT NULL,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    reason VARCHAR(255) NOT NULL,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Challans Table
CREATE TABLE IF NOT EXISTS challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id),
    total_quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Challan Items Table
CREATE TABLE IF NOT EXISTS challan_items (
    id SERIAL PRIMARY KEY,
    challan_id INT NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    product_name_snapshot VARCHAR(255) NOT NULL,
    product_sku_snapshot VARCHAR(100) NOT NULL,
    product_price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (name, business_name, mobile);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans (customer_id);
CREATE INDEX IF NOT EXISTS idx_challan_items_challan ON challan_items (challan_id);
