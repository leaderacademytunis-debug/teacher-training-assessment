/**
 * Marketplace Service (3009)
 * Manages product listings, shopping cart, and orders
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3009;
const DB_PATH = path.join(__dirname, '../leader_academy.db');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Database connection
let db = new sqlite3.Database(DB_PATH);

// In-memory shopping carts
const carts = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'marketplace', port: PORT });
});

// Get products
app.get('/api/marketplace/products', (req, res) => {
  const products = [\n    { id: 'prod-001', name: 'Teaching Guide', price: 29.99, category: 'books' },\n    { id: 'prod-002', name: 'Lesson Templates', price: 19.99, category: 'templates' },\n    { id: 'prod-003', name: 'Assessment Tools', price: 39.99, category: 'tools' },\n    { id: 'prod-004', name: 'Video Course', price: 49.99, category: 'courses' }\n  ];\n  \n  res.json({ success: true, data: products });\n});\n\n// Get product by ID\napp.get('/api/marketplace/products/:productId', (req, res) => {\n  const product = {\n    id: req.params.productId,\n    name: 'Teaching Guide',\n    price: 29.99,\n    description: 'Comprehensive guide for teachers',\n    category: 'books',\n    rating: 4.5,\n    reviews: 128\n  };\n  \n  res.json({ success: true, data: product });\n});\n\n// Search products\napp.get('/api/marketplace/search/:query', (req, res) => {\n  const results = [\n    { id: 'prod-001', name: 'Teaching Guide', price: 29.99 },\n    { id: 'prod-002', name: 'Teaching Templates', price: 19.99 }\n  ];\n  \n  res.json({ success: true, data: results });\n});\n\n// Get shopping cart\napp.get('/api/marketplace/cart/:userId', (req, res) => {\n  const cart = carts.get(req.params.userId) || { items: [], total: 0 };\n  res.json({ success: true, data: cart });\n});\n\n// Add to cart\napp.post('/api/marketplace/cart/add', (req, res) => {\n  const { user_id, product_id, quantity, price } = req.body;\n  \n  if (!carts.has(user_id)) {\n    carts.set(user_id, { items: [], total: 0 });\n  }\n  \n  const cart = carts.get(user_id);\n  cart.items.push({ product_id, quantity, price });\n  cart.total += price * quantity;\n  \n  res.json({ success: true, message: 'Item added to cart', cart });\n});\n\n// Remove from cart\napp.post('/api/marketplace/cart/remove', (req, res) => {\n  const { user_id, product_id } = req.body;\n  \n  const cart = carts.get(user_id);\n  if (cart) {\n    const itemIndex = cart.items.findIndex(item => item.product_id === product_id);\n    if (itemIndex > -1) {\n      const item = cart.items[itemIndex];\n      cart.total -= item.price * item.quantity;\n      cart.items.splice(itemIndex, 1);\n    }\n  }\n  \n  res.json({ success: true, message: 'Item removed from cart' });\n});\n\n// Checkout\napp.post('/api/marketplace/checkout', (req, res) => {\n  const { user_id, payment_method } = req.body;\n  \n  const cart = carts.get(user_id);\n  if (!cart || cart.items.length === 0) {\n    return res.status(400).json({ error: 'Cart is empty' });\n  }\n  \n  // Mock order creation\n  const order = {\n    order_id: `order-${Date.now()}`,\n    user_id,\n    items: cart.items,\n    total: cart.total,\n    payment_method,\n    status: 'pending',\n    created_at: new Date().toISOString()\n  };\n  \n  // Clear cart\n  carts.delete(user_id);\n  \n  res.json({ success: true, message: 'Order created', data: order });\n});\n\n// Get orders\napp.get('/api/marketplace/orders/:userId', (req, res) => {\n  const orders = [\n    { order_id: 'order-001', total: 79.98, status: 'delivered', created_at: '2026-04-01' },\n    { order_id: 'order-002', total: 49.99, status: 'processing', created_at: '2026-04-10' }\n  ];\n  \n  res.json({ success: true, data: orders });\n});\n\n// Get order details\napp.get('/api/marketplace/orders/:orderId/details', (req, res) => {\n  const order = {\n    order_id: req.params.orderId,\n    items: [\n      { product_id: 'prod-001', name: 'Teaching Guide', quantity: 2, price: 29.99 }\n    ],\n    total: 59.98,\n    status: 'delivered',\n    tracking: 'TRACK123456'\n  };\n  \n  res.json({ success: true, data: order });\n});\n\n// Get categories\napp.get('/api/marketplace/categories', (req, res) => {\n  const categories = [\n    { id: 'books', name: 'Books', count: 45 },\n    { id: 'templates', name: 'Templates', count: 32 },\n    { id: 'tools', name: 'Tools', count: 28 },\n    { id: 'courses', name: 'Courses', count: 56 }\n  ];\n  \n  res.json({ success: true, data: categories });\n});\n\n// Start server\napp.listen(PORT, () => {\n  console.log(`\\n✅ Marketplace Service running on http://localhost:${PORT}`);\n  console.log(`🛒 Endpoints: /health, /api/marketplace/products, /api/marketplace/cart, /api/marketplace/checkout\\n`);\n});\n\nmodule.exports = app;
