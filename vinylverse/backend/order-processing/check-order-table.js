// Check the actual structure of CUSTOMER_ORDER table
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
    
    console.log('Checking CUSTOMER_ORDER table structure...\n');
    const [columns] = await connection.query('DESCRIBE CUSTOMER_ORDER');
    
    console.log('CUSTOMER_ORDER table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    console.log('\nChecking existing data...');
    const [rows] = await connection.query('SELECT * FROM CUSTOMER_ORDER LIMIT 1');
    if (rows.length > 0) {
      console.log('Sample row:');
      console.log(JSON.stringify(rows[0], null, 2));
    } else {
      console.log('(No data in CUSTOMER_ORDER table)');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTable();

