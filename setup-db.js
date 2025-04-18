const mysql = require('mysql2');

// Create connection to MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

console.log('Setting up USSD Platform database...');

// Create database if it doesn't exist
connection.query('CREATE DATABASE IF NOT EXISTS ussd_db', (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Database created or already exists.');

  // Switch to the ussd_db database
  connection.query('USE ussd_db', (err) => {
    if (err) {
      console.error('Error selecting database:', err);
      process.exit(1);
    }

    // Create retailers table
    connection.query(`
      CREATE TABLE IF NOT EXISTS retailers (
        retailer_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating retailers table:', err);
        process.exit(1);
      }
      console.log('Retailers table created or already exists.');

      // Create products table
      connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          product_id INT AUTO_INCREMENT PRIMARY KEY,
          product_name VARCHAR(255) NOT NULL,
          product_cost DECIMAL(10,2) NOT NULL,
          retailer_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id)
      )`, (err) => {
        if (err) {
          console.error('Error creating products table:', err);
          process.exit(1);
        }
        console.log('Products table created or already exists.');

        // Create orders table
        connection.query(`
          CREATE TABLE IF NOT EXISTS orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            location VARCHAR(255) NOT NULL,
            product_name VARCHAR(100) NOT NULL,
            product_cost DECIMAL(10, 2) NOT NULL,
            order_status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating orders table:', err);
            process.exit(1);
          }
          console.log('Orders table created or already exists.');

          // Check if we should add sample data
          const addSampleData = process.argv.includes('--with-sample-data');
          if (addSampleData) {
            addSampleDataToDatabase(connection);
          } else {
            console.log('Setup complete! Run your application with: npm start');
            connection.end();
          }
        });
      });
    });
  });
});

// Function to add sample data
function addSampleDataToDatabase(connection) {
  console.log('Adding sample data...');

  // Add sample retailer
  connection.query(`
    INSERT INTO retailers (name, phone_number, location) 
    VALUES ('Sample Store', '+1234567890', 'City Center')
  `, (err, result) => {
    if (err) {
      console.error('Error adding sample retailer:', err);
      connection.end();
      return;
    }

    const retailerId = result.insertId;
    console.log(`Added sample retailer with ID: ${retailerId}`);

    // Add sample products
    const products = [
      ['Smartphone', 499.99, retailerId],
      ['Laptop', 899.99, retailerId],
      ['Headphones', 79.99, retailerId],
      ['Smart Watch', 199.99, retailerId]
    ];

    // Adjusted the query to match column names
    connection.query(`
      INSERT INTO products (name, description, price, retailer_id) 
      VALUES ?
    `, [products], (err) => {
      if (err) {
        console.error('Error adding sample products:', err);
      } else {
        console.log('Added sample products');
      }

      console.log('Sample data added! Run your application with: npm start');
      connection.end();
    });
  });
}