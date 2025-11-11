// Check the actual structure of CUSTOMER_ORDER_LINE_ITEM table
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
};

async function checkTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking CUSTOMER_ORDER_LINE_ITEM table structure...\n');
    const [columns] = await connection.query('DESCRIBE CUSTOMER_ORDER_LINE_ITEM');
    
    console.log('CUSTOMER_ORDER_LINE_ITEM table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTable();

