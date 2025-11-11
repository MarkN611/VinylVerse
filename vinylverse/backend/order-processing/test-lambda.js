// Quick test script to verify Lambda setup
// This simulates what Lambda will do

const mysql = require('mysql2/promise');

console.log('==========================================');
console.log('Testing Database Connection');
console.log('(Simulating what Lambda will do)');
console.log('==========================================');
console.log('');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
};

async function test() {
  try {
    console.log('1. Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Connected!');
    console.log('');

    console.log('2. Checking tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'VinylVerseDB'
      AND TABLE_NAME IN ('ITEM', 'SHIPPING_INFO', 'PAYMENT_INFO', 'CUSTOMER_ORDER', 'CUSTOMER_ORDER_LINE_ITEM')
    `);
    console.log(`   ✅ Found ${tables.length} required tables`);
    console.log('');

    console.log('3. Checking inventory...');
    const [items] = await connection.query('SELECT ITEM_NUMBER, NAME, UNIT_PRICE, AVAILABLE_QUANTITY FROM ITEM LIMIT 3');
    console.log(`   ✅ Found ${items.length} items in inventory:`);
    items.forEach(item => {
      console.log(`      - ${item.ITEM_NUMBER}: ${item.NAME} (Qty: ${item.AVAILABLE_QUANTITY})`);
    });
    console.log('');

    console.log('4. Checking recent orders...');
    const [orders] = await connection.query('SELECT COUNT(*) as count FROM CUSTOMER_ORDER');
    console.log(`   ✅ Total orders in database: ${orders[0].count}`);
    console.log('');

    console.log('==========================================');
    console.log('✅ Database is ready for Lambda!');
    console.log('==========================================');
    console.log('');
    console.log('Next: Test your Lambda function in AWS Console');
    console.log('   Go to: https://console.aws.amazon.com/lambda/');
    console.log('   Find: VinylVerse-orderprocessing');
    console.log('   Click: Test tab');
    console.log('   Use test event from TEST-IT.md');
    console.log('');

    await connection.end();

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    if (error.message.includes('Unknown database')) {
      console.error('Make sure your secret has: "database": "VinylVerseDB"');
    }
    process.exit(1);
  }
}

test();

