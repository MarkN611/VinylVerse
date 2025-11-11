// Test script to verify database connection
// Usage: node test-db-connection.js

const mysql = require('mysql2/promise');

// Database configuration - Update these with your actual credentials
const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'YOUR_DB_USER', // Replace with your database username
  password: 'YOUR_DB_PASSWORD', // Replace with your database password
  database: 'YOUR_DATABASE_NAME', // Replace with your database name
  port: 3306
};

async function testConnection() {
  let connection;
  
  try {
    console.log('Attempting to connect to database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Successfully connected to database!');
    
    // Test query - check if tables exist
    console.log('\nChecking for required tables...');
    
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM')
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    const requiredTables = ['ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM'];
    const existingTables = tables.map(t => t.TABLE_NAME);
    
    console.log('\nRequired tables:');
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table} - EXISTS`);
      } else {
        console.log(`  ✗ ${table} - MISSING`);
      }
    });
    
    // Check if ITEM table has data
    const [items] = await connection.query('SELECT COUNT(*) as count FROM ITEM');
    console.log(`\nItems in inventory: ${items[0].count}`);
    
    if (items[0].count > 0) {
      const [sampleItems] = await connection.query('SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY FROM ITEM LIMIT 5');
      console.log('\nSample items:');
      sampleItems.forEach(item => {
        console.log(`  - ${item.ITEM_NUMBER}: ${item.NAME} (Qty: ${item.AVAILABLE_QUANTITY})`);
      });
    } else {
      console.log('\n⚠ Warning: ITEM table is empty. You may want to insert test data.');
    }
    
    // Check recent orders
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM CUSTOMER_ORDER');
    console.log(`\nTotal orders in database: ${orders[0].count}`);
    
    if (orders[0].count > 0) {
      const [recentOrders] = await connection.query(`
        SELECT CONFIRMATION_ID, CUSTOMER_NAME, TOTAL, CREATED_AT 
        FROM CUSTOMER_ORDER 
        ORDER BY CREATED_AT DESC 
        LIMIT 3
      `);
      console.log('\nRecent orders:');
      recentOrders.forEach(order => {
        console.log(`  - ${order.CONFIRMATION_ID}: ${order.CUSTOMER_NAME} - $${order.TOTAL} (${order.CREATED_AT})`);
      });
    }
    
    console.log('\n✓ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify database credentials are correct');
    console.error('2. Check if database exists');
    console.error('3. Verify security group allows connections from your IP/Lambda');
    console.error('4. Check if database is publicly accessible (if connecting from local machine)');
    console.error('5. Verify VPC configuration if Lambda is in a VPC');
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

// Run the test
testConnection();

