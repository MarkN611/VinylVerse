// Script to list available databases
// Usage: node list-databases.js

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listDatabases() {
  console.log('==========================================');
  console.log('Listing Available Databases');
  console.log('==========================================');
  console.log('');

  const DB_HOST = 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com';
  const DB_USER = await question('Database User [admin]: ') || 'admin';
  const DB_PASS = await question('Database Password: ');
  
  console.log('');
  console.log(`Connecting to: ${DB_HOST}`);
  console.log(`User: ${DB_USER}`);
  console.log('');

  const dbConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: 3306
    // Don't specify database - connect to MySQL server directly
  };

  let connection;

  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected successfully!');
    console.log('');

    // List all databases
    const [databases] = await connection.query('SHOW DATABASES');
    
    console.log('Available databases:');
    console.log('-------------------');
    databases.forEach(db => {
      const dbName = db.Database;
      // Skip system databases
      if (!['information_schema', 'performance_schema', 'mysql', 'sys'].includes(dbName)) {
        console.log(`  ✓ ${dbName}`);
      }
    });
    console.log('');

    // If vinylverse exists, check its tables
    const vinylverseExists = databases.some(db => db.Database === 'vinylverse');
    if (vinylverseExists) {
      console.log('Checking tables in "vinylverse" database...');
      await connection.query('USE vinylverse');
      const [tables] = await connection.query('SHOW TABLES');
      if (tables.length > 0) {
        console.log('Existing tables:');
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`  - ${tableName}`);
        });
      } else {
        console.log('  (No tables found)');
      }
      console.log('');
    }

    console.log('==========================================');
    console.log('Use the database name shown above');
    console.log('(Most likely: "vinylverse" without "-db")');
    console.log('==========================================');

  } catch (error) {
    console.error('');
    console.error('✗ Error occurred!');
    console.error('Error message:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Wrong password - Double-check your database password');
    console.error('2. Security group - Check RDS security group allows your IP');
    console.error('3. Public access - Verify RDS is publicly accessible');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

listDatabases();

