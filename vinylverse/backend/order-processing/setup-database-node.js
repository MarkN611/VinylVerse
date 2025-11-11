// Database setup script using Node.js (no MySQL client needed)
// Usage: node setup-database-node.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('==========================================');
  console.log('VinylVerse Database Setup (Node.js)');
  console.log('==========================================');
  console.log('');

  // Get database credentials
  const DB_HOST = 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com';
  const DB_USER = await question('Database User [admin]: ') || 'admin';
  const DB_PASS = await question('Database Password: ');
  
  console.log('');
  console.log('⚠️  IMPORTANT: The database name is "VinylVerseDB" (capital V, D, B)');
  console.log('   NOT "vinylverse-db" - that is only the hostname!');
  console.log('');
  const DB_NAME = await question('Database Name [VinylVerseDB]: ') || 'VinylVerseDB';
  
  // Validate database name
  if (DB_NAME.toLowerCase() === 'vinylverse-db' || DB_NAME === 'vinylverse') {
    console.log('');
    console.log('❌ ERROR: Wrong database name!');
    console.log('   The correct name is: VinylVerseDB (capital V, D, B)');
    console.log('   The hostname has "-db" but the database name is "VinylVerseDB"');
    console.log('');
    process.exit(1);
  }
  
  console.log('');
  console.log(`Connecting to: ${DB_HOST}`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`User: ${DB_USER}`);
  console.log('');

  const dbConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    port: 3306,
    multipleStatements: true // Allow multiple SQL statements
  };

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
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table} - EXISTS`);
      } else {
        console.log(`  ✗ ${table} - MISSING`);
      }
    });
    console.log('');

    // Ask if user wants to insert sample data
    const insertData = await question('Insert sample inventory data? (y/n): ');
    
    if (insertData.toLowerCase() === 'y') {
      console.log('Inserting sample data...');
      // Note: The actual table uses UNIT_PRICE, not PRICE
      // Check table structure first to use correct column name
      const [columns] = await connection.query('DESCRIBE ITEM');
      const hasUnitPrice = columns.some(col => col.Field === 'UNIT_PRICE');
      const hasPrice = columns.some(col => col.Field === 'PRICE');
      
      const priceColumn = hasUnitPrice ? 'UNIT_PRICE' : (hasPrice ? 'PRICE' : null);
      
      if (!priceColumn) {
        console.log('⚠️  Warning: Could not determine price column name. Skipping sample data.');
      } else {
        await connection.query(`
          INSERT INTO ITEM (ITEM_NUMBER, NAME, DESCRIPTION, ${priceColumn}, AVAILABLE_QUANTITY) VALUES
          (1001, 'Pink Floyd - The Dark Side of the Moon', 'Original 1973 pressing', 24.99, 10),
          (1002, 'The Beatles - Abbey Road', 'Anniversary Edition LP', 22.99, 15),
          (1003, 'Prince - Purple Rain', 'Limited Edition 40th Anniversary', 29.99, 8),
          (1004, 'Michael Jackson - Thriller', '25th Anniversary Edition', 19.99, 12)
          ON DUPLICATE KEY UPDATE 
              NAME = VALUES(NAME),
              DESCRIPTION = VALUES(DESCRIPTION),
              ${priceColumn} = VALUES(${priceColumn}),
              AVAILABLE_QUANTITY = VALUES(AVAILABLE_QUANTITY)
        `);
        console.log('✓ Sample data inserted successfully!');
        console.log('');

        // Show inserted items (use the correct price column)
        const priceCol = hasUnitPrice ? 'UNIT_PRICE' : 'PRICE';
        const [items] = await connection.query(`SELECT ITEM_NUMBER, NAME, ${priceCol} as PRICE, AVAILABLE_QUANTITY FROM ITEM`);
        console.log('Current inventory:');
        items.forEach(item => {
          console.log(`  - ${item.ITEM_NUMBER}: ${item.NAME} - $${item.PRICE} (Qty: ${item.AVAILABLE_QUANTITY})`);
        });
      }
    }

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
    console.error('Common issues:');
    console.error('1. Wrong password - Double-check your database password');
    console.error('2. Database not accessible - Check security group allows your IP');
    console.error('3. Database doesn\'t exist - Verify database name is correct');
    console.error('4. Network issue - Check if RDS is publicly accessible');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

// Run setup
setupDatabase();

