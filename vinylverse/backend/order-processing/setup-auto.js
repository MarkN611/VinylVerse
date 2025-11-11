// Automatic setup with correct database name - NO PROMPTS!
// Usage: node setup-auto.js

const mysql = require('mysql2/promise');
const fs = require('fs');

// CORRECT CREDENTIALS - DO NOT CHANGE THE DATABASE NAME!
const DB_HOST = 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com';
const DB_USER = 'admin';
const DB_PASS = 'VinylVerse';
const DB_NAME = 'VinylVerseDB'; // ← THIS IS THE EXACT NAME! Don't change it!

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME, // VinylVerseDB - with capital V, D, B
  port: 3306,
  multipleStatements: true
};

async function setupDatabase() {
  console.log('==========================================');
  console.log('VinylVerse Database Setup (AUTO)');
  console.log('==========================================');
  console.log('');
  console.log('Using these credentials:');
  console.log(`  Host: ${DB_HOST}`);
  console.log(`  Database: ${DB_NAME} ← EXACT NAME!`);
  console.log(`  User: ${DB_USER}`);
  console.log('');

  let connection;

  try {
    // Test connection
    console.log('Testing database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connection successful!');
    console.log('');

    // Check if tables already exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'VinylVerseDB'
      AND TABLE_NAME IN ('ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM')
    `);

    const requiredTables = ['ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM'];
    const existingTables = tables.map(t => t.TABLE_NAME);
    
    console.log('Checking tables:');
    let allExist = true;
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table} - EXISTS`);
      } else {
        console.log(`  ✗ ${table} - MISSING`);
        allExist = false;
      }
    });
    console.log('');

    if (!allExist) {
      console.log('Creating missing tables...');
      const schemaSQL = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
      await connection.query(schemaSQL);
      console.log('✓ Schema created!');
    } else {
      console.log('✓ All tables already exist!');
    }
    console.log('');

    // Check inventory
    const [items] = await connection.query('SELECT COUNT(*) as count FROM ITEM');
    console.log(`Items in inventory: ${items[0].count}`);
    
    if (items[0].count > 0) {
      const [sampleItems] = await connection.query(`
        SELECT ITEM_NUMBER, NAME, UNIT_PRICE, AVAILABLE_QUANTITY 
        FROM ITEM 
        LIMIT 5
      `);
      console.log('\nSample items:');
      sampleItems.forEach(item => {
        const price = item.UNIT_PRICE || item.PRICE || 'N/A';
        console.log(`  - ${item.ITEM_NUMBER}: ${item.NAME} - $${price} (Qty: ${item.AVAILABLE_QUANTITY})`);
      });
    }
    console.log('');

    // Check orders
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM CUSTOMER_ORDER');
    console.log(`Total orders: ${orders[0].count}`);
    console.log('');

    console.log('==========================================');
    console.log('✓ Database is ready!');
    console.log('==========================================');
    console.log('');
    console.log('For AWS Secrets Manager, use this EXACT JSON:');
    console.log(JSON.stringify({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME, // VinylVerseDB - exact name!
      port: 3306
    }, null, 2));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('✗ Error occurred!');
    console.error('Error:', error.message);
    console.error('');
    if (error.message.includes('Unknown database')) {
      console.error('The database name must be EXACTLY: VinylVerseDB');
      console.error('(Capital V, capital D, capital B - no spaces, no dashes)');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

