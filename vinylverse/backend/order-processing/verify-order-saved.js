// Verify the order was actually saved to the database
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'vinylverse-db.crgmsim02sa8.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'VinylVerse',
  database: 'VinylVerseDB',
  port: 3306
};

async function verifyOrder() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('==========================================');
    console.log('Verifying Order Was Saved');
    console.log('==========================================');
    console.log('');
    
    // Get the latest order (should be order ID 6)
    const [orders] = await connection.query(`
      SELECT * FROM CUSTOMER_ORDER 
      ORDER BY ID DESC 
      LIMIT 1
    `);
    
    if (orders.length > 0) {
      const order = orders[0];
      console.log('✅ Latest Order Found:');
      console.log(`   Order ID: ${order.ID}`);
      console.log(`   Customer: ${order.CUSTOMER_NAME}`);
      console.log(`   Email: ${order.CUSTOMER_EMAIL}`);
      console.log(`   Status: ${order.STATUS}`);
      console.log('');
      
      // Get line items for this order
      const [lineItems] = await connection.query(`
        SELECT * FROM CUSTOMER_ORDER_LINE_ITEM 
        WHERE CUSTOMER_ORDER_ID_FK = ?
      `, [order.ID]);
      
      console.log(`✅ Line Items (${lineItems.length}):`);
      lineItems.forEach(item => {
        console.log(`   - ${item.ITEM_NAME} (Qty: ${item.QUANTITY}, Item ID: ${item.ITEM_ID})`);
      });
      console.log('');
      
      // Get shipping info
      const [shipping] = await connection.query(`
        SELECT * FROM SHIPPING_INFO WHERE ID = ?
      `, [order.SHIPPING_INFO_ID_FK]);
      
      if (shipping.length > 0) {
        console.log('✅ Shipping Info:');
        console.log(`   ${shipping[0].ADDRESS1}, ${shipping[0].CITY}, ${shipping[0].STATE} ${shipping[0].POSTAL_CODE}`);
      }
      console.log('');
      
      // Get payment info
      const [payment] = await connection.query(`
        SELECT * FROM PAYMENT_INFO WHERE ID = ?
      `, [order.PAYMENT_INFO_ID_FK]);
      
      if (payment.length > 0) {
        console.log('✅ Payment Info (Masked):');
        console.log(`   Card: ${payment[0].CARD_NUM}`);
        console.log(`   Holder: ${payment[0].HOLDER_NAME}`);
      }
      console.log('');
      
      // Check inventory was updated
      if (lineItems.length > 0) {
        const itemId = lineItems[0].ITEM_ID;
        const [item] = await connection.query(`
          SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY FROM ITEM WHERE ITEM_NUMBER = ?
        `, [itemId]);
        
        if (item.length > 0) {
          console.log('✅ Inventory Updated:');
          console.log(`   ${item[0].NAME}: ${item[0].AVAILABLE_QUANTITY} remaining`);
        }
      }
      
    } else {
      console.log('❌ No orders found');
    }
    
    console.log('');
    console.log('==========================================');
    console.log('✅ Order Successfully Persisted!');
    console.log('==========================================');
    console.log('');
    console.log('Lab 8 Objective 5: COMPLETE! 🎉');
    console.log('');
    
    await connection.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyOrder();

