// Check the actual structure of the ITEM table
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
};

async function checkStructure() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking ITEM table structure...\n');
    const [columns] = await connection.query('DESCRIBE ITEM');
    
    console.log('ITEM table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\nChecking existing data...');
    const [rows] = await connection.query('SELECT * FROM ITEM LIMIT 1');
    if (rows.length > 0) {
      console.log('Sample row:');
      console.log(JSON.stringify(rows[0], null, 2));
    } else {
      console.log('(No data in ITEM table)');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStructure();

