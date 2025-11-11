// Quick test with your credentials
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  port: 3306
  // Don't specify database - connect to server first
};

async function test() {
  try {
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected!');
    
    console.log('\nListing databases...');
    const [databases] = await connection.query('SHOW DATABASES');
    
    console.log('\nAvailable databases (excluding system databases):');
    databases.forEach(db => {
      const dbName = db.Database;
      if (!['information_schema', 'performance_schema', 'mysql', 'sys'].includes(dbName)) {
        console.log(`  ✓ ${dbName}`);
      }
    });
    
    // Try to connect to 'vinylverse' database
    console.log('\nTrying to connect to "vinylverse" database...');
    await connection.end();
    
    const dbConfigWithDB = { ...dbConfig, database: 'vinylverse' };
    const conn2 = await mysql.createConnection(dbConfigWithDB);
    console.log('✓ Successfully connected to "vinylverse" database!');
    
    // Check tables
    const [tables] = await conn2.query('SHOW TABLES');
    console.log(`\nTables in "vinylverse" database: ${tables.length}`);
    if (tables.length > 0) {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    }
    
    await conn2.end();
    console.log('\n✓ The correct database name is: vinylverse');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.message.includes("Unknown database")) {
      console.error('\nThe database name might be different. Available databases listed above.');
    }
  }
}

test();

