const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Adjust if your MySQL password is different
  database: 'ussd_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Serve frontend (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all retailers
app.get('/api/retailers', (req, res) => {
  db.query('SELECT * FROM retailers', (err, results) => {
    if (err) {
      console.error('❌ Error fetching retailers:', err.message);
      return res.status(500).json({ error: 'Failed to fetch retailers' });
    }
    res.json(results);
  });
});

// Get products for a specific retailer
app.get('/api/products/:retailerId', (req, res) => {
  const { retailerId } = req.params;
  db.query('SELECT * FROM products WHERE retailer_id = ?', [retailerId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching products:', err.message);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(results);
  });
});


// Add a new retailer
app.post('/api/retailers', (req, res) => {
  const { name, phoneNumber, location } = req.body;
  db.query(
    'INSERT INTO retailers (name, phone_number, location) VALUES (?, ?, ?)',
    [name, phoneNumber, location],
    (err, result) => {
      if (err) {
        console.error('❌ Error adding retailer:', err.message);
        return res.status(500).json({ error: 'Failed to add retailer' });
      }
      res.json({ retailerId: result.insertId });
    }
  );
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { name, price, retailerId } = req.body;
  db.query(
    'INSERT INTO products (product_name, product_cost, retailer_id) VALUES (?, ?, ?)',
    [name, price, retailerId],
    (err, result) => {
      if (err) {
        console.error('❌ Error adding product:', err.message);
        return res.status(500).json({ error: 'Failed to add product' });
      }
      res.json({ productId: result.insertId });
    }
  );
});
app.get('/api/retailers/:retailerId/products', (req, res) => {
  const { retailerId } = req.params;
  db.query('SELECT * FROM products WHERE retailer_id = ?', [retailerId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching retailer products:', err.message);
      return res.status(500).json({ error: 'Failed to fetch retailer products' });
    }
    res.json(results);
  });
});

// Place an order
app.post('/api/orders', (req, res) => {
  const { name, phoneNumber, location, product } = req.body;
  db.query(
    'INSERT INTO orders (name, phone_number, location, product_name, product_cost) VALUES (?, ?, ?, ?, ?)',
    [name, phoneNumber, location, product.product_name, product.product_cost],
    (err, result) => {
      if (err) {
        console.error('❌ Error placing order:', err.message);
        return res.status(500).json({ error: 'Failed to place order' });
      }
      res.json({ orderId: result.insertId });
    }
  );
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});