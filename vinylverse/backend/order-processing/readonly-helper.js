// readonly-helper.js
// Small read-only Lambda to run DESCRIBE/SELECT statements against the VinylVerse RDS
// Usage: deploy to the same environment as the order-processing Lambda (same SECRET_ARN env var and role permissions)

const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || 'us-east-2' });

async function getDbCredentials(secretArn) {
  const data = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
  if (!data || !data.SecretString) throw new Error('Secret not found or empty');
  return JSON.parse(data.SecretString);
}

exports.handler = async function(event) {
  const secretArn = process.env.SECRET_ARN;
  if (!secretArn) return { statusCode: 500, body: 'SECRET_ARN not set' };

  const cmds = event && event.query ? [event.query] : [
    "DESCRIBE CUSTOMER_ORDER",
    "SELECT order_id, CUSTOMER_NAME, CUSTOMER_EMAIL, TOTAL, CONFIRMATION_ID, CREATED_AT FROM CUSTOMER_ORDER ORDER BY order_id DESC LIMIT 5",
    "SELECT * FROM CUSTOMER_ORDER_LINE_ITEM ORDER BY CUSTOMER_ORDER_ID_FK DESC LIMIT 10",
    "SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY FROM ITEM WHERE ITEM_NUMBER='v1'"
  ];

  try {
    const creds = await getDbCredentials(secretArn);
    const pool = mysql.createPool({
      host: creds.host,
      user: creds.user,
      password: creds.password,
      database: creds.database,
      port: creds.port ? parseInt(creds.port) : 3306,
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0,
    });

    const conn = await pool.getConnection();
    try {
      const results = {};
      for (const c of cmds) {
        try {
          const [rows] = await conn.query(c);
          results[c] = { ok: true, rows };
        } catch (qerr) {
          results[c] = { ok: false, error: qerr.message };
        }
      }
      console.log('DB readonly results:', JSON.stringify(results, null, 2));
      conn.release();
      return { statusCode: 200, body: JSON.stringify({ ok: true, results }) };
    } catch (err) {
      conn.release();
      console.error('Query loop error', err);
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  } catch (err) {
    console.error('Helper error', err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
