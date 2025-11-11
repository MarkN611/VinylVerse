// index.js - order-processing Lambda handler (Node 18)
// Uses mysql2/promise and AWS Secrets Manager to persist orders into a MySQL-compatible DB
// 
// Lab 8 Objective 5: Refactor order management microservice to persist customer order into the database
// 
// This Lambda function:
// 1. Accepts POST requests with customer order data (items, shipping, payment, customer info)
// 2. Validates inventory availability for all items
// 3. Persists the order to MySQL database in a single transaction:
//    - Inserts shipping information into SHIPPING_INFO table
//    - Inserts masked payment information into PAYMENT_INFO table
//    - Inserts order header into CUSTOMER_ORDER table
//    - Inserts line items into CUSTOMER_ORDER_LINE_ITEM table
//    - Updates inventory quantities in ITEM table
// 4. Returns confirmation ID and order ID on success
//
// Environment variables expected:
// - SECRET_ARN : ARN of Secrets Manager secret with JSON { host, user, password, database, port }
// - AWS_REGION (optional, defaults to us-east-2)

const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || 'us-east-2' });

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

async function getDbCredentials(secretArn) {
  const data = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
  if (!data || !data.SecretString) throw new Error('Secret not found or empty');
  return JSON.parse(data.SecretString);
}

function generateConfirmationId() {
  const hex = crypto.randomBytes(3).toString('hex');
  return `ORD-${Date.now()}-${hex}`;
}

exports.handler = async function(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Only accept POST requests for order creation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Only POST is supported.' })
    };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid order: items required' })
      };
    }

    const secretArn = process.env.SECRET_ARN;
    if (!secretArn) throw new Error('SECRET_ARN not set');
    const creds = await getDbCredentials(secretArn);

    const pool = mysql.createPool({
      host: creds.host,
      user: creds.user,
      password: creds.password,
      database: creds.database,
      port: creds.port ? parseInt(creds.port) : 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Check inventory
      const insufficient = [];
      // helper to resolve incoming item identifier to ITEM_ID (supports numeric id, or 'vN' -> N)
      function resolveIncomingItemId(incomingId) {
        if (!incomingId && incomingId !== 0) return null;
        if (typeof incomingId === 'number') return incomingId;
        const s = String(incomingId).trim();
        if (/^\d+$/.test(s)) return parseInt(s, 10);
        const m = s.match(/^v(\d+)$/i);
        if (m) return parseInt(m[1], 10);
        return null;
      }

      // cache resolved items to avoid duplicate lookups
      const resolvedItems = {};
      for (const it of body.items) {
        const incoming = it.id;
        const itemNum = resolveIncomingItemId(incoming);
        let r;
        if (itemNum != null) {
          const [rows] = await conn.query('SELECT ID, ITEM_NUMBER, AVAILABLE_QUANTITY, NAME FROM ITEM WHERE ITEM_NUMBER = ?', [itemNum]);
          r = rows[0];
        } else {
          // fallback: attempt to find by NAME if incoming id isn't numeric
          const [rows] = await conn.query('SELECT ID, ITEM_NUMBER, AVAILABLE_QUANTITY, NAME FROM ITEM WHERE NAME = ? LIMIT 1', [it.name || incoming]);
          r = rows[0];
        }
        const available = r ? r.AVAILABLE_QUANTITY : 0;
        const resolvedId = r ? r.ID : null;
        const resolvedItemNum = r ? r.ITEM_NUMBER : null;
        resolvedItems[incoming] = { dbId: resolvedId, itemNumber: resolvedItemNum, name: r ? r.NAME : (it.name || ''), available };
        if ((it.qty || 0) > available) insufficient.push({ id: incoming, name: r ? r.NAME : it.name, requested: it.qty || 0, available });
      }
      if (insufficient.length) {
        await conn.rollback();
        conn.release();
        return {
          statusCode: 409,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'insufficient_inventory', details: insufficient })
        };
      }

      // Insert shipping
      const shipping = body.shipping || {};
      const [shipRes] = await conn.query(
        `INSERT INTO SHIPPING_INFO (ADDRESS1, ADDRESS2, CITY, STATE, COUNTRY, POSTAL_CODE, EMAIL)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [shipping.address1 || '', shipping.address2 || '', shipping.city || '', shipping.state || '', shipping.country || '', shipping.postalCode || shipping.zip || '', shipping.email || body.customer?.email || '']
      );
      const shippingId = shipRes.insertId;

      // Insert payment (mask)
      const payment = body.payment || {};
      const cardNum = payment.cardNumber || payment.card_num || '';
      const last4 = cardNum ? cardNum.toString().slice(-4) : '';
      const masked = last4 ? `**** **** **** ${last4}` : '';
      const [payRes] = await conn.query(
        `INSERT INTO PAYMENT_INFO (HOLDER_NAME, CARD_NUM, EXP_DATE) VALUES (?, ?, ?)`,
        [payment.cardName || payment.holderName || '', masked, payment.expiration || payment.exp_date || '']
      );
      const paymentId = payRes.insertId;

      // Insert order (adapted to existing schema: CUSTOMER_ORDER has ID, CUSTOMER_NAME, CUSTOMER_EMAIL, SHIPPING_INFO_ID_FK, PAYMENT_INFO_ID_FK, STATUS)
      const customer = body.customer || {};
      const confirmationId = generateConfirmationId();
      const [orderRes] = await conn.query(
        `INSERT INTO CUSTOMER_ORDER (CUSTOMER_NAME, CUSTOMER_EMAIL, SHIPPING_INFO_ID_FK, PAYMENT_INFO_ID_FK, STATUS)
         VALUES (?, ?, ?, ?, ?)`,
        [customer.name || '', customer.email || '', shippingId, paymentId, 'New']
      );
      const orderId = orderRes.insertId;

      // Insert line items and update inventory using existing schema (ITEM_ID stores the ITEM_NUMBER, ITEM_NAME, QUANTITY, CUSTOMER_ORDER_ID_FK)
      for (const it of body.items) {
        const incoming = it.id;
        const resolved = resolvedItems[incoming] || {};
        const dbId = resolved.dbId;
        const itemNumber = resolved.itemNumber;
        const itemName = it.name || resolved.name || '';
        await conn.query(
          `INSERT INTO CUSTOMER_ORDER_LINE_ITEM (ITEM_ID, ITEM_NAME, QUANTITY, CUSTOMER_ORDER_ID_FK)
           VALUES (?, ?, ?, ?)`,
          [itemNumber, itemName, it.qty || 0, orderId]
        );
        if (dbId != null) {
          const qty = it.qty || 0;
          if (qty > 0) {
            const [updRes] = await conn.query(
              `UPDATE ITEM SET AVAILABLE_QUANTITY = AVAILABLE_QUANTITY - ? WHERE ID = ? AND AVAILABLE_QUANTITY >= ?`,
              [qty, dbId, qty]
            );
            if (!updRes || updRes.affectedRows !== 1) {
              // Not enough stock at update time; abort
              await conn.rollback();
              conn.release();
              return {
                statusCode: 409,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'insufficient_inventory', details: [{ id: incoming, name: itemName, requested: qty, available: resolved.available }] })
              };
            }
          }
        }
      }

      await conn.commit();
      conn.release();

      // Return success response with confirmation ID and order ID
      // Lab 8 Objective 5: Order has been successfully persisted to database
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          confirmationId,
          orderId,
          status: 'confirmed',
          message: 'Order successfully persisted to database'
        })
      };

    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error('Transaction error:', err);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'internal_error', message: err.message })
      };
    }

  } catch (err) {
    console.error('Handler error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'internal_error', message: err.message })
    };
  }
};
