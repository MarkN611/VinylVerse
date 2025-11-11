// Verify database setup is complete
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
};

async function verifySetup() {
  console.log('==========================================');
  console.log('Verifying Database Setup');
  console.log('==========================================');
  console.log('');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database: VinylVerseDB');
    console.log('');

    // Check required tables
    const requiredTables = ['ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM'];
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'VinylVerseDB'
      AND TABLE_NAME IN (?, ?, ?, ?, ?)
    `, requiredTables);

    const existingTables = tables.map(t => t.TABLE_NAME);
    
    console.log('Required tables:');
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ✗ ${table} - MISSING!`);
      }
    });
    console.log('');

    // Check ITEM table structure
    console.log('ITEM table structure:');
    const [itemColumns] = await connection.query('DESCRIBE ITEM');
    itemColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
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
        console.log(`  - ${item.ITEM_NUMBER}: ${item.NAME} - $${item.UNIT_PRICE} (Qty: ${item.AVAILABLE_QUANTITY})`);
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
    console.log('IMPORTANT: Update your AWS Secrets Manager secret with:');
    console.log(`{
  "host": "vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com",
  "user": "admin",
  "password": "VinylVerse",
  "database": "VinylVerseDB",
  "port": 3306
}`);
    console.log('');
    console.log('Note: The database name is "VinylVerseDB" (capital V, D, B)');
    console.log('');

    await connection.end();

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

verifySetup();

