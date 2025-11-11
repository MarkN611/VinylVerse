// Quick setup script with correct database name
// Usage: node setup-database-quick.js

const mysql = require('mysql2/promise');
const fs = require('fs');

const DB_HOST = 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com';
const DB_USER = 'admin';
const DB_PASS = 'VinylVerse';
const DB_NAME = 'VinylVerseDB'; // Correct database name!

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: 3306,
  multipleStatements: true
};

async function setupDatabase() {
  console.log('==========================================');
  console.log('VinylVerse Database Setup');
  console.log('==========================================');
  console.log('');
  console.log(`Host: ${DB_HOST}`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`User: ${DB_USER}`);
  console.log('');

  let connection;

  try {
    // Test connection
    console.log('Testing database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connection successful!');
    console.log('');

    // Read and execute schema
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
    await connection.query(schemaSQL);
    console.log('✓ Schema created successfully!');
    console.log('');

    // Check if tables exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM')
      ORDER BY TABLE_NAME
    `, [DB_NAME]);

    const requiredTables = ['ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM'];
    const existingTables = tables.map(t => t.TABLE_NAME);
    
    console.log('Required tables:');
    let allTablesExist = true;
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table} - EXISTS`);
      } else {
        console.log(`  ✗ ${table} - MISSING`);
        allTablesExist = false;
      }
    });
    console.log('');

    // Insert sample data
    console.log('Inserting sample inventory data...');
    await connection.query(`
      INSERT INTO ITEM (ITEM_NUMBER, NAME, DESCRIPTION, PRICE, AVAILABLE_QUANTITY) VALUES
      ('1', 'Pink Floyd - The Dark Side of the Moon', 'Original 1973 pressing', 24.99, 10),
      ('2', 'The Beatles - Abbey Road', 'Anniversary Edition LP', 22.99, 15),
      ('3', 'Prince - Purple Rain', 'Limited Edition 40th Anniversary', 29.99, 8),
      ('4', 'Michael Jackson - Thriller', '25th Anniversary Edition', 19.99, 12)
      ON DUPLICATE KEY UPDATE 
          NAME = VALUES(NAME),
          DESCRIPTION = VALUES(DESCRIPTION),
          PRICE = VALUES(PRICE),
          AVAILABLE_QUANTITY = VALUES(AVAILABLE_QUANTITY)
    `);
    console.log('✓ Sample data inserted successfully!');
    console.log('');

    // Show inserted items
    const [items] = await connection.query('SELECT ITEM_NUMBER, NAME, PRICE, AVAILABLE_QUANTITY FROM ITEM');
    console.log('Current inventory:');
    items.forEach(item => {
      console.log(`  - ${item.ITEM_NUMBER}: ${item.NAME} - $${item.PRICE} (Qty: ${item.AVAILABLE_QUANTITY})`);
    });

    console.log('');
    console.log('==========================================');
    console.log('Database setup complete!');
    console.log('==========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create AWS Secrets Manager secret with these credentials:');
    console.log(`   {
     "host": "${DB_HOST}",
     "user": "${DB_USER}",
     "password": "${DB_PASS}",
     "database": "${DB_NAME}",
     "port": 3306
   }`);
    console.log('');
    console.log('2. Update Lambda environment variable SECRET_ARN with the secret ARN');
    console.log('3. Test the order processing API');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('✗ Error occurred!');
    console.error('Error message:', error.message);
    console.error('');
    if (error.message.includes('Unknown database')) {
      console.error('The database name might be incorrect. Run: node quick-test.js to list databases');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

