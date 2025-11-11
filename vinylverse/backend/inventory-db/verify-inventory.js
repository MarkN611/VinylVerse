// verify-inventory.js - local helper to test DB inventory retrieval
// Usage:
//   SECRET_ARN=arn:aws:secretsmanager:...:secret:your-secret AWS_REGION=us-east-2 node verify-inventory.js
// Requires aws-sdk v2 and mysql2 (already in package.json)

const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

const secretArn = process.env.SECRET_ARN;
const region = process.env.AWS_REGION || 'us-east-2';
if (!secretArn) {
  console.error('SECRET_ARN env var required');
  process.exit(1);
}

const sm = new AWS.SecretsManager({ region });

async function main() {
  const secretVal = await sm.getSecretValue({ SecretId: secretArn }).promise();
  if (!secretVal || !secretVal.SecretString) throw new Error('Secret empty or not found');
  const creds = JSON.parse(secretVal.SecretString);
  const pool = await mysql.createPool({
    host: creds.host,
    user: creds.username || creds.user,
    password: creds.password,
    database: creds.dbname || creds.database,
    port: creds.port ? parseInt(creds.port, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
  });
  const [rows] = await pool.query('SELECT ITEM_NUMBER, NAME, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM ORDER BY ITEM_NUMBER');
  const shaped = rows.map(r => ({ id: `v${r.ITEM_NUMBER}`, name: r.NAME, price: Number(r.UNIT_PRICE || 0), qty: r.AVAILABLE_QUANTITY }));
  console.table(shaped);
  await pool.end();
}

main().catch(e => {
  console.error('Error verifying inventory:', e);
  process.exit(2);
});
